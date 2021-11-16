<template>
  <q-page class="column justify-center q-gutter-y-md q-pt-sm">
    <div class="lt-sm text-center text-h4 q-py-sm">
      T-Swaps Bridge
    </div>
    <from-card />
    <div class="text-center">
      <q-icon
        class="swapArrow"
        name="fas fa-arrow-down"
        size="1.5rem"
        @click="switchChains()"
      />
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
import ual from "src/boot/ual_mixin";

export default {
  name: "Index",
  components: { fromCard, toCard },
  mixins: [ual],
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
    ...mapGetters("tokens", ["getTokens"]),
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
    ...mapActions("account", ["accountExistsOnChain", "logout"]),
    ...mapActions("tokens", [
      "updateTELOSDioTokens",
      "updateBridgeTokens",
      "updateTokenBalances"
    ]),
    ...mapActions("blockchains", ["updateCurrentChain"]),

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
      if (
        this.getToken.telosdio === true &&
        this.getToChain.NETWORK_NAME.toUpperCase() !==
          this.getCurrentChain.NETWORK_NAME
      ) {
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
        this.getToken.bridgestart === true &&
        this.getToChain.NETWORK_NAME.toUpperCase() !==
          this.getCurrentChain.NETWORK_NAME
      ) {
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
      } else {
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
      }
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        // TODO clear values
        this.$store.commit("bridge/setAmount", "");
        this.$store.commit("bridge/setToAccount", "");
        this.$store.commit("bridge/setMemo", "");
      }
      await this.updateTokenBalances(this.accountName);
    },

    async switchChains() {
      if (this.getToChain.NETWORK_NAME !== this.getFromChain.NETWORK_NAME) {
        if (this.isAuthenticated) {
          this.$q.notify({
            color: "info",
            textColor: "dark",
            icon: "info",
            message: "Log in to send"
          });
        }
        const toChain = this.getToChain;
        await this.logout();
        await this.updateCurrentChain(toChain.NETWORK_NAME.toUpperCase());
        await this.$store.$api.setAPI(this.$store);
        await this.setUAL();
        this.$store.commit("tokens/clearTokens");
        this.$store.commit("bridge/setToChain", this.getFromChain);
        this.$store.commit("bridge/setFromChain", toChain);
      }
    }
  },
  async mounted() {
    await this.updateBridgeTokens();
    await this.updateTELOSDioTokens();
    await this.updateTokenBalances(this.accountName);

    // Set default tokens
    this.$store.commit("bridge/setToken", this.getTokens[0]);

    // Poll for token balances
    this.pollTokens = setInterval(async () => {
      await this.updateTokenBalances(this.accountName);
    }, 20000);

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
        this.$store.commit("bridge/setToken", this.getTokens[0]);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
body.body--light {
  .swapArrow {
    color: $dark-0;
    &:hover {
      color: rgba($dark-0, 0.5);
    }
  }
}

body.body--dark {
  .swapArrow {
    color: $cyan;
    &:hover {
      color: rgba($cyan, 0.7);
    }
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
