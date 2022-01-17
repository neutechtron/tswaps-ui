<template>
  <div >
    <q-btn v-if="isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Swap"
      @click="trySwap()"
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
      "getCurrentChain",
      "getNetworkByName"
    ]),
    ...mapGetters("swap", [
      "getToken",
      "getFromToken",
      "getToToken",
      "getAmount",
      "getMemo"
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
    }
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "logout"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tokens", [
      "updateTokens",
      "updateTokenBalances"
    ]),
    ...mapActions("swap", ["createMemo"]),
  

    async trySwap() {
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

    async swap() {
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
        console.log("Trying to do a swap");
        const actions = [
          {
            account: this.token_contract,// token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT, // pool contract
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
  },
  created() {
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
    }
  }
};
</script>

<style lang="scss" scoped></style>
