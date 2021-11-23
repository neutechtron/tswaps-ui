<template>
  <div >
    <q-btn v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Swap"
      @click="trySend()"
    />
    <q-btn v-else
      no-caps
      class="sendBtn full-width"
      label="Connect Wallet"
      @click="showLogin = true"
    />

    <q-dialog v-model="showLogin">
      <q-list>
        <q-item
          v-for="(wallet, idx) in $ual.authenticators"
          :key="wallet.getStyle().text"
          v-ripple
          :style="{
            background: wallet.getStyle().background,
            color: wallet.getStyle().textColor
          }"
        >
          <q-item-section class="cursor-pointer" avatar @click="onLogin(idx)">
            <img :src="wallet.getStyle().icon" width="30" />
          </q-item-section>
          <q-item-section class="cursor-pointer" @click="onLogin(idx)">
            {{ wallet.getStyle().text }}
          </q-item-section>
          <q-item-section class="flex" avatar>
            <q-spinner
              v-if="loading === wallet.getStyle().text"
              :color="wallet.getStyle().textColor"
              size="2em"
            />
            <q-btn
              v-else
              :color="wallet.getStyle().textColor"
              icon="get_app"
              @click="openUrl(wallet.getOnboardingLink())"
              target="_blank"
              dense
              flat
              size="12px"
            >
              <q-tooltip>
                Get app
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item
          v-if="error"
          :active="!!error"
          active-class="bg-red-1 text-grey-8"
        >
          <q-item-section>
            {{ error }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Index",
  components: { 
  },
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
    ...mapActions("account", ["accountExistsOnChain","login"]),
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
    },

    async onLogin(idx) {
      this.error = null;
      const error = await this.login({ idx });
      if (!error) {
        this.showLogin = false;
      } else {
        this.error = error;
      }
    },
    openUrl(url) {
      window.open(url);
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

<style lang="scss" scoped></style>
