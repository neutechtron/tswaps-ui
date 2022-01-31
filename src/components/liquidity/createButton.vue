<template>
  <div>
    <q-btn
      v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Create Pool"
      @click="tryCreatePool()"
      :disable="!hasInput"
    />
    <q-btn
      v-else
      no-caps
      class="sendBtn full-width"
      label="Login"
      @click="showLogin = true"
    />
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

    canPayFee() {
      return (
        this.getSwapToken.amount > this.$getQuantity(this.getConfig.listing_fee)
      );
    },

    hasInput() {
      return (
        this.getToken1 && this.getToken2 && this.getValue1 && this.getValue2
      );
    },
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updatePools", "updateConfig"]),
    ...mapActions("tokens", ["updateTokens", "updateTokenBalances"]),
    ...mapActions("liquidity", ["updateActivePool"]),

    async tryCreatePool() {
      try {
        await this.createPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          message: "Pool Created",
        });
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
              quantity: `${parseFloat(
                this.$getQuantity(this.getConfig.listing_fee)
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
              pair_id: this.getConfig.last_pair_id + 1, // TODO include min_amount
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
      await this.updatePools();
      await this.updateTokens();
      await this.updateTokenBalances(this.accountName);
      await this.updateActivePool();
    },

    openUrl(url) {
      window.open(url);
    },
  },
  async mounted() {
    await this.updatePools();
    await this.updateTokens();
    await this.updateTokenBalances(this.accountName);
    await this.updateActivePool();
  },

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
