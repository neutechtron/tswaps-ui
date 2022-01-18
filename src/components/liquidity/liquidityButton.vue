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
      error: null
    };
  },
  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading"
    ]),
    ...mapGetters("liquidity", [
      "getToken1",
      "getToken2",
      "getValue1",
      "getValue2",
      "getPool",
      "getMemo"
    ])
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("liquidity", ["createMemo"]),
    ...mapActions("tokens", ["updateTokens", "updateTokenBalances"]),

    async tryAddLiquidity() {
      try {
        await this.createMemo();
        await this.add();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          message: "Liquidity added"
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
        console.log("Trying to do add liquidity");
        const actions = [
          {
            account: this.getToken1?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "nottswapsioa", // pool contract
              quantity: `${parseFloat(this.getValue1).toFixed(
                this.getToken1?.precision
              )} ${this.getToken1?.symbol}`,
              memo: ``
            }
          },
          {
            account: this.getToken1?.contract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "nottswapsioa", // pool contract
              quantity: `${parseFloat(this.getValue2).toFixed(
                this.getToken2?.precision
              )} ${this.getToken2?.symbol}`,
              memo: ``
            }
          },
          {
            account: this.getPool?.id, // token contract
            name: "push",
            data: {
              from: this.accountName.toLowerCase(),
              to: "nottswapsioa", // pool contract
              quantity: `${parseFloat(this.getAmount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: this.getMemo
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }

      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        // TODO clear values
        this.$store.commit("swap/setAmount", "");
        this.$store.commit("swap/setMemo", "");
      }
      await this.updateTokenBalances(this.accountName);
    },

    openUrl(url) {
      window.open(url);
    }
  },
  async mounted() {
    await this.updatePools();
    await this.updateTokens();
    await this.updateTokenBalances(this.accountName);

    // TODO remove, not a fan of hyperion
    // if (this.isAuthenticated) {
    //   this.updateAllTokensBalances(this.accountName);
    // }
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
    }
  }
};
</script>

<style lang="scss" scoped></style>
