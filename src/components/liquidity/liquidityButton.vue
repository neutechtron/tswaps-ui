<template>
  <div >
    <q-btn v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Add liquidity"
      @click="tryAddLiquidity()"
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
    ...mapGetters("liquidity", [
      "getToken1",
      "getToken2",
      "getValue1",
      "getValue2",
      "getPool"
    ]),
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain","login"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tokens", [
      "updateTokens",
      "updateTokenBalances"
    ]),

    async tryAddLiquidity() {
      try {
        await this.createMemo();
        await this.swap();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Swap complete"
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
        throw new Error(`Account ${this.accountName} does not have the required funds to preform swap`);
      }

      let transaction;
      if (
         true 
      ) {
        console.log("Trying to do add liquidity");
        const actions = [
          {
            account: this.getToken1?.contract,// token contract
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
            account: this.getToken1?.contract,// token contract
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
            account: this.getPool?.id,// token contract
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
    await this.updatePools();
    await this.updateTokens();
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
