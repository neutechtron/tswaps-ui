<template>
  <q-page class="column justify-center q-gutter-y-md">
    <from-card />
    <div class="text-center">
      <q-icon class="swapArrow" name="fas fa-arrow-down" size="1.5rem" />
    </div>
    <to-card />
    <div class="flex justify-center">
      <q-btn
        no-caps
        class="sendBtn self-center"
        label="Send"
        @click="trySend()"
      />
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import fromCard from "src/components/FromCard";
import toCard from "src/components/ToCard";
import { accountName } from "src/store/account/getters";
import { getFromChain } from "src/store/bridge/getters";

export default {
  name: "Index",
  components: { fromCard, toCard },
  data() {
    return {
      showTransaction: false,
      transaction: null,
      fromNetwork: "TELOS",
      pollTokens: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", [
      "getAllPossibleChains",
      "getCurrentChain",
      "getNetworkByName"
    ]),
    ...mapGetters("bridge", [
      "getToken",
      "getFromChain",
      "getToChain",
      "getFromAccount",
      "getToAccount",
      "getAmount",
      "getMemo"
    ]),
    token_contract() {
      return this.getToken ? this.getToken.contract : null;
    },
    token_precision() {
      return this.getToken ? this.getToken.precision : null;
    },
    token_symbol() {
      return this.getToken ? this.getToken.symbol : null;
    }
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain"]),
    ...mapActions("tokens", [
      "updateTELOSDioTokens",
      "updateBridgeTokens",
      "updateTokenBalances"
    ]),

    async trySend() {
      try {
        await this.send();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Sent"
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async send() {
      if (
        !(await this.accountExistsOnChain({
          account: this.getToAccount,
          network: this.getToChain.NETWORK_NAME
        }))
      ) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.getToAccount} does not exist`
        });
        return;
      }

      let transaction;
      if (this.getToken.telosdio === true) {
        console.log("Sending across TELOSD bridge");
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "telosd.io",
              quantity: `${parseFloat(this.getAmount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: `${
                this.getToAccount
              }@${this.getToChain.NETWORK_NAME.toLowerCase()}|${this.getMemo}`
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      } else if (
        this.getToChain.NETWORK_NAME.toUpperCase() ===
        this.getCurrentChain.NETWORK_NAME
      ) {
        // if normal transfer to same network
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: this.getToAccount,
              quantity: `${parseFloat(this.getAmount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: this.getMemo
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      } else {
        // If different EOS network, send to bridge
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "bridge.start",
              quantity: `${parseFloat(this.getAmount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: `${
                this.getToAccount
              }@${this.getToChain.NETWORK_NAME.toLowerCase()}|${this.getMemo}`
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        // TODO clear values
        this.$store.commit("bridge/setAmount", "");
        this.$store.commit("bridge/setToAccount", "");
        this.$store.commit("bridge/setMemo", "");
      }
    }
  },
  async mounted() {
    await this.updateBridgeTokens();
    await this.updateTELOSDioTokens();
    await this.updateTokenBalances(this.accountName);

    // TODO remove, not a fan of hyperion
    // if (this.isAuthenticated) {
    //   this.updateAllTokensBalances(this.accountName);
    // }
  },
  created() {
    this.$store.commit("bridge/setFromChain", this.getAllPossibleChains[0]);
    this.$store.commit("bridge/setToChain", this.getAllPossibleChains[1]);
  },
  watch: {
    async getFromChain() {
      await this.updateBridgeTokens();
      await this.updateTELOSDioTokens();
    },
    async accountName() {
      if (this.isAuthenticated) {
        // await this.updateBridgeTokens();
        // await this.updateTELOSDioTokens();
        await this.updateTokenBalances(this.accountName);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
body.body--light {
  .swapArrow {
    color: $dark-0;
  }
}

body.body--dark {
  .swapArrow {
    color: $cyan;
  }
  // .sendBtn {
  //   background: $cyan;
  // }
}

.sendBtn {
  background-image: linear-gradient(
    to right,
    $purpleBright 20%,
    $blueLight 80%
  );
  &:hover {
    background-image: linear-gradient(
      to left,
      $purpleBright 20%,
      $blueLight 80%
    );
  }
  color: #ffffff;
  font-size: 1.2rem;
  flex-basis: 400px;
  height: 3rem;
}
</style>
