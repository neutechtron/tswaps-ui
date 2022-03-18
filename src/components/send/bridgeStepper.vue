<template>
  <div class="bridgeStepper">
    <q-stepper
      v-model="step"
      ref="stepper"
      alternative-labels
      done-color="deep-purple-13"
      active-color="deep-purple-13"
      inactive-color="deep-purple-3"
      animated
    >

      <!-- account datails tab -->
      <q-step
        :name="1"
        title="Connect wallet"
        icon="fas fa-wallet"
        :done="step > 1"
      >
        <div class="row">
          <div class="col-12 q-mb-sm"
          >
            <div class="text-h5 q-mb-sm">
              Connect wallet
            </div>
          </div>
          <div class="col-12" >
            <connect/>
          </div>
          <div class="col-12 q-my-lg" >
            <connect/>
          </div>
          
        </div>
        
      </q-step>

      <!-- personal info tab -->
      <q-step
        :name="2"
        title="Transaction details"
        icon="fas fa-file-invoice-dollar"
        :done="step > 2"
      >
        <div class="row">
          <div class="col-12 q-mb-sm">
            <div class="text-h5 q-mb-sm">
              Transaction details
            </div>
          </div>
          <div class="col-12" >
            <coin-selector/>
          </div>
          <div class="col-12">
              <div class="row justify-between q-px-sm q-gutter-x-sm">
              <div>
                {{ selectedNetwork }} balance: {{ remoteBalance }}
                {{ selectedTokenSym }}
              </div>
              <div>Minimum: {{ minSend }} {{ selectedTokenSym }}</div>
            </div>
            <amount-input
              :selectedTokenSym="selectedTokenSym"
              :selectedToken="selectedToken"
              :amount.sync="amount"
              :balance="balance"
              :min="minSend"
            />
          </div>
          
        </div>
      </q-step>

      <!-- address -->
      

      <!-- social link -->
      <q-step
        :name="3"
        title="Confirm"
        icon="fas fa-clipboard-check"
      >
        <div class="row">
          <div class="col-12 q-mb-sm"
          >
            <div class="text-h5 q-mb-sm">
              Confirm
            </div>
          </div>
          <div class="col-12" md="6">
              <q-input
                id="v-twitter"
                placeholder=""
              />
          </div>
          
        </div>
      </q-step>
      <template v-slot:navigation>
        <q-stepper-navigation >
          <q-btn @click="$refs.stepper.next()"  :label="step === 3 ? 'Finish' : 'Continue'" class=" bridgeButton"/>
          <q-btn v-if="step > 1" flat color="white" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm bridgeButton" />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import 'vue-form-wizard/dist/vue-form-wizard.min.css';
import coinSelector from "../CoinSelector.vue";
import connect from "./Connect.vue";
import amountInput from "src/components/send/AmountInput";

export default {
  components: {
    connect,
    coinSelector,
    amountInput
  },
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
      remoteBalance: 0,
      step: 1,
      remoteContractInstance: null,
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM",
    }
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTPortTokens",
      "getTeleports"
    ]),
    ...mapGetters("blockchains", [
      "getCurrentChain",
      "getNetworkByName",
      "getBridgeTokens"
    ]),

    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    avatar() {
      return this.selectedToken ? this.selectedToken.avatar : "";
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    minSend() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (typeof token === "undefined") return 0;
      else return this.$chainToQty(token.min_quantity);
    },

    supportedEosChains() {
      const bridgeTokens = this.getBridgeTokens;
      if (bridgeTokens && this.selectedToken !== undefined) {
        // console.log({ bridgeTokens });
        let res = [this.getCurrentChain.NETWORK_NAME];
        for (let token of bridgeTokens) {
          if (
            this.$getSymFromAsset(token.token_info) === this.selectedTokenSym
          ) {
            res.push(token.channel.toUpperCase());
          }
        }
        return res;
      } else return [];
    },

    supportedEvmChains() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (token) {
        // console.log({ token });
        let res = [];
        for (let r of token.remote_contracts) {
          const network = this.getEvmNetworkList.find(
            el => el.remoteId === r.key
          );
          if (network) res.push(network.name.toUpperCase());
        }
        return res;
      } else return [];
    },

    networkOptions() {
      return [...this.supportedEosChains, ...this.supportedEvmChains];
    },

    tportTokens() {
      // let tportTokens = [];
      // if (this.getTPortTokens.length > 0) {
      //   tportTokens = this.getTPortTokens.map(el => el.token.sym);
      // }
      // return tportTokens
      if (this.getTPortTokens.length === 0) return [];
      else return this.getTPortTokens.map(el => el.token.sym);
    }
  },
  methods: {
    ...mapActions("account", ["reloadWallet", "setWalletBalances"]),
    ...mapActions("blockchains", ["setBridgeTokens"]),
    ...mapActions("tport", ["setTPortTokens"]),
    formSubmitted() {
      console.log("submit")
    },
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    this.selectedNetwork = this.getCurrentChain.NETWORK_NAME;
    this.setBridgeTokens();
    this.reloadWallet(this.accountName);
    this.setTPortTokens();
    this.$store.dispatch("tport/setTeleports", this.accountName);
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
      this.$store.dispatch("tport/setTeleports", this.accountName);
    },
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        this.connectWeb3();
        this.switchMetamaskNetwork(this.selectedNetwork);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
 .bridgeStepper {
   width: 700px;
   max-width: 80vw;
 }
 .bridgeButton {
   color: white;
   background-color: rgb(85,42,248);
 }
</style>
