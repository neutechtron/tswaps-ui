<template>
  <q-page class="column justify-center q-gutter-y-md">
    <from-card />
    {{ accountName }}
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

export default {
  name: "Index",
  components: { fromCard, toCard },
  data() {
    return {
      to: "fuzzytestnet",
      amount: "1.0000 START",
      memo: "new bridge",
      showTransaction: false,
      transaction: null,
      fromNetwork: "TELOS",
      toNetwork: "EOS",
      selectedToken: { sym: "4,USDT", contract: "tokens.swaps" }
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", [
      "getAllPossibleChains",
      "getCurrentChain",
      "getNetworkByName"
    ]),
    token_contract() {
      return this.selectedToken ? this.selectedToken.contract : null;
    },
    token_precision() {
      return this.selectedToken
        ? this.$exSymToPrecision(this.selectedToken)
        : null;
    },
    token_symbol() {
      return this.selectedToken
        ? this.$exSymToSymbol(this.selectedToken)
        : null;
    }
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain"]),
    ...mapActions("tokens", [
      "updateTELOSDioTokens",
      "updateBridgeTokens",
      "updateAllTokensBalances"
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
          account: this.to,
          network: this.toNetwork
        }))
      ) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }

      let transaction;
      // TODO if TELOSD token is selected, send across TELOSD bridge
      if (false) {
        console.log("Sending across TELOSD bridge");
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "telosd.io",
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: `${this.to}@${this.toNetwork.toLowerCase()}|${this.memo}`
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      } else if (
        this.toNetwork.toUpperCase() === this.getCurrentChain.NETWORK_NAME
      ) {
        // if normal transfer to same network
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: this.to,
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: this.memo
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
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_precision
              )} ${this.token_symbol}`,
              memo: `${this.to}@${this.toNetwork.toLowerCase()}|${this.memo}`
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.to = null;
        this.amount = null;
        this.memo = "";
        // this.$refs.sendForm.reset();
        // this.$refs.sendForm.resetValidation();
        // this.setWalletBalances(this.accountName);
      }
    }
  },
  async mounted() {
    this.updateTELOSDioTokens();
    await this.updateBridgeTokens();

    if (this.isAuthenticated) {
      this.updateAllTokensBalances(this.accountName);
    }
  },
  created() {
    this.$store.commit("bridge/setFromChain", this.getAllPossibleChains[0]);
    this.$store.commit("bridge/setToChain", this.getAllPossibleChains[1]);
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
  .sendBtn {
    background: $cyan;
  }
}

.sendBtn {
  color: $dark-0;
  flex-basis: 400px;
  height: 3rem;
}
</style>
