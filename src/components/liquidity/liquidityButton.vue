<template>
  <div>
    <q-btn
      v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Add liquidity"
      @click="tryAddLiquidity()"
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
    ]),
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updatePools"]),
    // ...mapActions("liquidity", ["createMemo"]),
    ...mapActions("tokens", [
      "updateTokens",
      "updateTokenBalances",
      "updateAllTokensBalances",
    ]),
    ...mapActions("liquidity", ["updateActivePool"]),

    async tryAddLiquidity() {
      try {
        // await this.createMemo();
        await this.add();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          message: "Liquidity added",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async add() {
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
        const actions = [
          {
            account: this.getToken1?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT,
              quantity: `${parseFloat(this.getValue1).toFixed(
                this.getToken1?.precision
              )} ${this.getToken1?.symbol}`,
              memo: `deposit,${this.getPool.id}`,
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
              memo: `deposit,${this.getPool.id}`,
            },
          },
          {
            account: process.env.SWAP_CONTRACT,
            name: "deposit",
            data: {
              owner: this.accountName,
              pair_id: this.getPool.id, // TODO include min_amount
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
    await this.updateActivePool();
  },
  created() {},
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
