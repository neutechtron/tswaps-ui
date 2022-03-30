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
      header-class="stepper-header"
    >
      <q-step
        :name="1"
        title="Connect wallet"
        icon="fas fa-wallet"
        :done="step > 1"
      >
        <div class="row">
          <div class="col-12 q-mb-sm">
            <div class="text-h5 q-mb-sm">Connect wallet</div>
          </div>

          <div class="col-12 q-my-sm">
            <q-separator />
          </div>

          <div class="col-12 q-my-md">
            <connect
              :isFrom="true"
              :isNative="this.isNative(true)"
              :selectedNetwork="this.getFromChain.NETWORK_NAME"
            />
          </div>

          <div class="col-12 q-my-sm">
            <q-separator />
          </div>

          <div class="col-12 q-my-md">
            <connect
              :isFrom="false"
              :isNative="this.isNative(false)"
              :selectedNetwork="this.getToChain.NETWORK_NAME"
            />
          </div>
        </div>
      </q-step>

      <q-step
        :name="2"
        title="Transaction details"
        icon="fas fa-file-invoice-dollar"
        :done="step > 2"
      >
        <div class="col-12 q-mb-sm">
          <div class="text-h5 q-mb-sm">Transaction details</div>
        </div>
        <div class="row q-px-lg q-pb-lg q-mb-sm bordered">
          <div
            class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding"
          >
            {{ "From " + getFromChain.NETWORK_NAME }}
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold">
            <token-avatar
              class="q-mx-sm"
              :token="getFromChain.NETWORK_NAME"
              :avatarSize="35"
            />

            <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
            <token-avatar
              class="q-mx-sm"
              :token="getToChain.NETWORK_NAME"
              :avatarSize="35"
            />
          </div>
          <div
            class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding"
          >
            {{ "To " + getToChain.NETWORK_NAME }}
          </div>
        </div>
        <div class="row">
          <div class="col-12 q-mb-sm">
            <coin-selector />
          </div>

          <div class="col-12">
            <div
              class="row justify-between q-px-sm q-gutter-x-sm"
              v-if="getToken.contract !== ''"
            >
              <div>
                {{ selectedNetwork }} balance: {{ getToken.amount.toString() }}
                {{ getToken.symbol }}
              </div>
              <div>Minimum: {{ getToken.min_quantity }}</div>
            </div>
            <amount-input
              :selectedTokenSym="getToken.symbol"
              :selectedToken="getToken"
              :amount="getAmount"
              @update:amount="updateAmount($event)"
              :balance="getToken.amount"
              :min="minSend"
            />
          </div>
        </div>
      </q-step>

      <q-step :name="3" title="Confirm" icon="fas fa-clipboard-check">
        <div class="text-h5 q-mb-sm">Confirm Transaction</div>
        <div class="row q-px-lg q-pb-lg bordered q-pb-md">
          <div
            class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding"
          >
            {{ "From " + getFromChain.NETWORK_NAME }}
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold">
            <token-avatar
              class="q-mx-sm"
              :token="getFromChain.NETWORK_NAME"
              :avatarSize="35"
            />

            <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
            <token-avatar
              class="q-mx-sm"
              :token="getToChain.NETWORK_NAME"
              :avatarSize="35"
            />
          </div>
          <div
            class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding"
          >
            {{ "To " + getToChain.NETWORK_NAME }}
          </div>
          <div
            class="col-12 row items-center justify-center text-h6 text-bold q-mt-md"
          >
            <token-avatar
              class="q-mx-sm"
              :token="getToken.symbol"
              :avatarSize="35"
            />
            {{ getAmount }} {{ getToken.symbol }}
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col-12 q-mb-sm">
            <div class="text-body1">
              Your transfer will start once you confirm the transaction.
            </div>
            <div class="text-body1">Transfers can take up to 24 hours.</div>
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <div class="row">
            <q-btn
              v-if="step > 1"
              flat
              color="white"
              @click="$refs.stepper.previous()"
              label="Previous"
              class="q-ml-sm bridgeButton nextButton"
            />
            <q-space />
            <q-btn
              @click="handleNext()"
              :label="step === 3 ? 'Confirm' : 'Next'"
              class="bridgeButton"
            />
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <send-tx-dialog
      :transaction="transaction"
      :showTransaction.sync="showTransaction"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import coinSelector from "./CoinSelector.vue";
import connect from "./Connect.vue";
import amountInput from "./AmountInput";
import sendTxDialog from "./SendTxDialog";
import tokenAvatar from "src/components/TokenAvatar.vue";
import { ethers } from "ethers";

export default {
  components: {
    connect,
    coinSelector,
    amountInput,
    sendTxDialog,
    tokenAvatar,
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
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTPortTokens",
      "getTeleports",
      "getEvmAccountName",
      "getEvmChainId",
      "getEvmNetwork",
      "getEvmRemoteId",
    ]),
    ...mapGetters("blockchains", [
      "getCurrentChain",
      "getNetworkByName",
      "getBridgeTokens",
      "getAllPossibleChains",
    ]),
    ...mapGetters("bridge", [
      "getToChain",
      "getFromChain",
      "getToken",
      "getAmount",
      "getToNative",
    ]),

    selectedToken() {
      return this.getToken.symbol;
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
            (el) => el.remoteId === r.key
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
      if (this.getTPortTokens.length === 0) return [];
      else return this.getTPortTokens.map((el) => el.token.sym);
    },
  },
  methods: {
    ...mapActions("account", ["reloadWallet", "setWalletBalances"]),
    ...mapActions("tport", [
      "updateTPortTokens",
      "updateTportTokenBalances",
      "updateWeb3",
      "updateTeleports",
      "updateTportTokenBalancesEvm",
    ]),
    ...mapActions("bridge", ["updateAmount", "sendBridgeToken"]),

    formSubmitted() {
      console.log("submit");
    },

    isNative(isFrom) {
      if (isFrom) return this.getFromChain.NETWORK_NAME == "TELOS";
      else return this.getToChain.NETWORK_NAME == "TELOS";
    },

    isWalletsConnected() {
      return (
        this.getEvmAccountName &&
        this.getEvmAccountName !== "" &&
        this.isAuthenticated
      );
    },

    isValidTransaction() {
      return (
        this.getToken.contract !== "" &&
        this.getAmount > 0 &&
        this.getAmount < this.getToken.amount
      );
    },

    handleNext() {
      if (this.step === 1 && this.isWalletsConnected()) {
        this.getToNative
          ? this.updateTportTokenBalancesEvm()
          : this.updateTportTokenBalances();
        this.$refs.stepper.next();
      } else if (this.step === 2 && this.isValidTransaction()) {
        this.$refs.stepper.next();
      } else if (this.step === 3) {
        this.send();
      }
    },

    async send() {
      try {
        this.transaction = await this.sendBridgeToken();
        if (this.transaction) {
          this.showTransaction = true;
          this.transaction = this.transaction.transactionId;
          this.to = null;
          this.amount = null;
          this.memo = "";
          this.updateTeleports(this.accountName);
        }
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Sent",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },
    // async updateTportTokenBalancesEvm() {
    //   try {
    //     if (this.getEvmChainId && this.getEvmAccountName) {
    //       let tokens = this.getTPortTokens;
    //       let remoteContractAddress = undefined;
    //       let balance = 0;
    //       for (const token of tokens) {
    //         try {
    //           const { injectedWeb3, web3 } = await this.$web3();
    //           if (injectedWeb3) {
    //             if (this.wrongNetwork(this.getEvmNetwork, this.getFromChain))
    //               balance = 0;
    //             else {
    //               if (token == undefined) {
    //               } else {
    //                 remoteContractAddress = token.remote_contracts.find(
    //                   (el) => el.key === this.getEvmRemoteId
    //                 );
    //                 if (remoteContractAddress !== undefined) {
    //                   remoteContractAddress = remoteContractAddress.value;
    //                   const remoteInstance = new web3.eth.Contract(
    //                     this.$erc20Abi,
    //                     remoteContractAddress
    //                   ); // TODO Add check to validate abi
    //                   const remotebalance = await remoteInstance.methods
    //                     .balanceOf(this.getEvmAccountName)
    //                     .call();
    //                   balance = Number(
    //                     parseFloat(
    //                       ethers.utils
    //                         .formatUnits(
    //                           remotebalance,
    //                           await remoteInstance.methods.decimals().call()
    //                         )
    //                         .toString()
    //                     ).toFixed(token.decimals)
    //                   );
    //                 }
    //               }
    //             }
    //           }
    //           if (balance !== undefined && balance !== 0) {
    //             let precision = this.$assetToPrecision(balance);
    //             if (token.decimals === 0) {
    //               this.$store.commit("tport/setTokenPrecision", {
    //                 token: token,
    //                 precision: precision,
    //               });
    //             }
    //             this.$store.commit("tport/setTokenAmount", {
    //               token: token,
    //               amount: this.$assetToAmount(balance),
    //             });
    //           } else {
    //             this.$store.commit("tport/setTokenAmount", {
    //               token: token,
    //               amount: 0,
    //             });
    //           }
    //         } catch (error) {
    //           this.$store.commit("tport/setTokenAmount", {
    //             token: token,
    //             amount: 0,
    //           });
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.log("Error getting chain token balance:", error);
    //     this.$store.commit("general/setErrorMsg", error.message || error, {
    //       root: true,
    //     });
    //   }
    // },
    wrongNetwork(evmNetwork, selectedNetwork) {
      if (evmNetwork) {
        return (
          evmNetwork.name.toUpperCase() !==
          selectedNetwork.NETWORK_NAME.toUpperCase()
        );
      } else return true;
    },
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    this.selectedNetwork = this.getCurrentChain.NETWORK_NAME;
    this.reloadWallet(this.accountName);
    this.updateTPortTokens();
    this.updateTeleports(this.accountName);
    this.getToNative
      ? this.updateTportTokenBalancesEvm()
      : this.updateTportTokenBalances();
    this.$store.commit("bridge/setFromChain", this.getAllPossibleChains[0]);
    this.$store.commit("bridge/setToChain", this.getAllPossibleChains[1]);
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
      this.updateTeleports(this.accountName);
    },
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        this.connectWeb3();
        this.switchMetamaskNetwork(this.selectedNetwork);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bridgeStepper {
  width: 700px;
  max-width: 95vw;
}
.bridgeButton {
  color: white;
  background-color: rgb(85, 42, 248);
}
.bordered {
  border: 2px solid $primary;
  border-radius: 15px;
  padding: 5px;
  //background: rgb(227,223,247) !important;
}
.small-padding {
  padding-top: 4px;
}
</style>
