<template>
  <div>
    <q-btn
      v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Create Pool"
      @click="tryCreatePool()"
      :disable="!hasInput || !canPayFee"
    />
    <q-btn
      v-else
      no-caps
      class="sendBtn full-width"
      label="Login"
      @click="showLogin = true"
    />

    <div
      class="text-center text-red-7 q-pt-sm fit row wrap justify-center items-center content-center"
      v-if="!canPayFee && hasInput"
    >
      <q-icon name="fas fa-exclamation-triangle" class="q-pr-xs" />Not enough
      SWAP tokens
    </div>

    <ual-dialog :showLogin.sync="showLogin" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UalDialog from "src/components/UalDialog.vue";

export default {
  components: { UalDialog },
  data() {
    return {
      showTransaction: false,
      transaction: null,
      fromNetwork: "TELOS",
      pollTokens: null,
      showLogin: false,
      error: null,
    };
  },
  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading",
    ]),
    ...mapGetters("liquidity", [
      "getToken1",
      "getToken2",
      "getValue1",
      "getValue2",
      "getPool",
      "getHasPool",
      "getAmplifier",
      "getProtocol",
    ]),
    ...mapGetters("pools", ["getConfig"]),
    ...mapGetters("tokens", ["getSwapToken"]),

    hasInput() {
      return (
        this.getToken1 && this.getToken2 && this.getValue1 && this.getValue2
      );
    },

    canPayFee() {
      if (this.getConfig && this.getSwapToken) {
        return (
          this.getSwapToken.amount >
          this.$getQuantity(this.getConfig.listing_fee)
        );
      } else {
        return false;
      }
    },
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updatePools", "updateConfig"]),
    ...mapActions("tokens", ["updateTokens", "updateTokenBalances"]),
    ...mapActions("liquidity", [
      "updateActivePool",
      "updateSelectedTokenBalance",
    ]),

    async tryCreatePool() {
      try {
        await this.createPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: `Pool created. ${this.transaction.slice(0, 8)}...`,
          timeout: 7000,
          actions: [
            {
              label: "View on Explorer",
              color: "white",
              handler: () => {
                openURL(
                  `https://eosauthority.com/transaction/${
                    this.transaction
                  }?network=${
                    process.env.TESTNET == "true" ? "telostest" : "telos"
                  }`
                );
              },
            },
          ],
        });
        this.updatePools();
        this.updateTokens();
        await this.updateTokenBalances(this.accountName);
        this.updateActivePool();
        this.updateSelectedTokenBalance();
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async createPool() {
      await this.updateConfig();

      if (!this.accountName) {
        throw new Error(`Account ${this.getToAccount} does not exist`);
      }

      let transaction;
      if (true) {
        const actions = [
          {
            account: this.getConfig.listing_fee?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT,
              quantity: `${this.$getQuantity(
                this.getConfig.listing_fee
              ).toFixed(
                this.$exAssToPrecision(this.getConfig.listing_fee)
              )} ${this.$exAssToSymbol(this.getConfig.listing_fee)}`,
              memo: `listingfee`,
            },
          },
          {
            account: process.env.SWAP_CONTRACT,
            name: "createpair",
            data: {
              creator: this.accountName,
              reserve0: {
                sym: `${this.getToken1.precision},${this.getToken1.symbol}`,
                contract: this.getToken1.contract,
              },
              reserve1: {
                sym: `${this.getToken2.precision},${this.getToken2.symbol}`,
                contract: this.getToken2.contract,
              },
              amplifier: this.getAmplifier,
              protocol: this.getProtocol,
            },
          },
          {
            account: this.getToken1?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT,
              quantity: `${parseFloat(this.getValue1).toFixed(
                this.getToken1?.precision
              )} ${this.getToken1?.symbol}`,
              memo: `deposit,${this.getConfig.last_pair_id + 1}`,
            },
          },
          {
            account: this.getToken2?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT,
              quantity: `${parseFloat(this.getValue2).toFixed(
                this.getToken2?.precision
              )} ${this.getToken2?.symbol}`,
              memo: `deposit,${this.getConfig.last_pair_id + 1}`,
            },
          },
          {
            account: process.env.SWAP_CONTRACT,
            name: "deposit",
            data: {
              owner: this.accountName,
              pair_id: this.getConfig.last_pair_id + 1,
              min_amount: 0, // TODO min_amount
            },
          },
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }

      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.$store.commit("liquidity/setValue1", 0);
        this.$store.commit("liquidity/setValue2", 0);
      }
    },

    openUrl(url) {
      window.open(url);
    },
  },
  async mounted() {},

  watch: {
    async getFromChain() {
      await this.updateTokens();
    },
    async accountName() {
      if (this.isAuthenticated) {
        await this.updateTokenBalances(this.accountName);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
