<template>
  <div>
    <q-btn
      v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Swap"
      @click="trySwap()"
      :disable="!getIsValidPair"
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
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("swap", [
      "getToken",
      "getFromToken",
      "getToToken",
      "getAmount",
      "getMemo",
      "getIsValidPair",
    ]),
    token_contract() {
      return this.getFromToken?.contract;
    },
    token_precision() {
      return this.getFromToken?.precision;
    },
    token_symbol() {
      return this.getFromToken?.symbol;
    },
    token_balance() {
      return this.getFromToken?.amount;
    },
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "logout"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tokens", ["updateTokens", "updateTokenBalances"]),
    ...mapActions("swap", ["createMemo", "updateSwapPool"]),

    async trySwap() {
      try {
        await this.createMemo();
        await this.swap();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Swap complete",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async swap() {
      if (!this.accountName) {
        throw new Error(`Account ${this.getToAccount} does not exist`);
      }
      if (Number(this.token_balance) <= Number(this.getAmount)) {
        throw new Error(
          `Account ${this.accountName} does not have the required funds to preform swap`
        );
      }

      let transaction;
      if (true) {
        console.log("Trying to do a swap");
        const actions = [
          {
            account: this.token_contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT, // pool contract
              quantity: `${parseFloat(this.getAmount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: this.getMemo,
            },
          },
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }

      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.$store.commit("swap/setAmount", 0);
        this.$store.commit("swap/setMemo", "");
        this.$store.commit("swap/setToEstimate", 0);
      }
      await this.updatePools();
      await this.updateTokens();
      await this.updateTokenBalances(this.accountName);
      await this.updateSwapPool();
    },
  },
  async mounted() {
    await this.updatePools();
    await this.updateTokens();
    await this.updateTokenBalances(this.accountName);
    await this.updateSwapPool();
  },
  watch: {
    async isAuthenticated() {
      await this.updatePools();
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
