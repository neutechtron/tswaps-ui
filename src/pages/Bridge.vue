<template>
  <q-page >
    <div class="q-pa-sm">

      <div class="row justify-center q-my-md">
        <div class="col-12">
          <head-buttons />
        </div>
      </div>
    
      <div class="row justify-center q-mt-xs">
        <div class="col-12">

          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
        
              <div class="row">
                <div class="col-sm-12 ">
                  <from-card />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <span class="ml-2 fa-stack fa-1x">
                  <i class="fas fa-square fa-stack-2x swapSquare"></i>
                  <i class="fas fa-arrow-down  fa-stack-1x fa-inverse swapArrow" ></i>
                </span>
              </div>

              <div class="row ">
                <div class="col-sm-12 ">
                  <to-card />
                </div>
              </div>

              <div class="row  q-mt-md">
                <div class="col-12 ">
                  <liquidity-button/>
                </div>
              </div>

              <div class="row">
                <div class="col-12 ">
                  <div class="flex justify-center q-pt-md">
                    <q-btn
                      :disable="!isAuthenticated"
                      no-caps
                      class="sendBtn self-center"
                      label="Send"
                      @click="trySend()"
                    />
                  </div>
                </div>
              </div> 

            </q-card-section>
          </q-card>

        </div>
      </div>

    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import fromCard from "src/components/bridge/FromCard";
import toCard from "src/components/bridge/ToCard";
import headButtons from "src/components/bridge/Head.vue"
import ual from "src/boot/ual_mixin";

export default {
  name: "Index",
  components: { fromCard, toCard, headButtons },
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
      "updateBridgeTokens",
      "updateTokenBalances"
    ]),
    ...mapActions("blockchains", ["updateCurrentChain"]),

    async trySwap() {
      try {
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
      if (
        !(await this.accountExistsOnChain({
          account: this.getAccount,
          network: this.getCurrentChain
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
        console.log("Trying to do a swap");
        const actions = [
          {
            account: this.token_contract,// token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: this.getToAccount, // pool contract
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
        await this.updateTokenBalances(this.accountName);
        this.$store.commit("bridge/setToken", this.getTokens[0]);
      }
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
