<template>
  <q-form @submit="trySend" ref="sendForm">
    <!--     <div class="row">
      <div class="networks row justify-center q-pb-sm">
        <div class="text-weight-light text-subtitle2  col-12 text-center">
          {{ currentChain.NETWORK_NAME }} Balance
        </div>
        <div>{{ balance }} {{ selectedTokenSym }}</div>
      </div>
      <div class="networks row justify-center q-pb-sm">
        <div class="text-weight-light text-subtitle2  col-12 text-center">
          {{ selectedNetwork }} Balance
        </div>
        <div>{{ remoteBalance }} {{ selectedTokenSym }}</div>
      </div> 
    </div>-->

    <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
      <div class="input-outline row justify-between items-center">
        <q-btn
          v-if="getEvmAccountName === ''"
          label="CONNECT"
          @click="connectWeb3()"
          class="hover-accent"
          color="positive"
          outline
          no-shadow
          no-caps
        />
        <div
          class="evm-account col ellipsis cursor-pointer"
          style="max-width: 200px"
          v-else
          @click="copyEvmAccount"
        >
          {{ getEvmAccountName }}
        </div>
        <net-selector
          :selectedNetwork="selectedNetwork"
          :networkOptions="networkOptions"
          @changeNetwork="$emit('update:selectedNetwork', $event)"
        />
      </div>
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
    <div class="text-center self-stretch q-pt-sm q-gutter-x-sm">
      <q-btn
        class="hover-accent"
        size="lg"
        color="primary"
        dense
        no-shadow
        label="Send"
        style="width: 40%"
        type="submit"
        :disabled="selectedToken === undefined || wrongNetwork"
      />
      <q-icon
        size="16px"
        name="fas fa-external-link-alt"
        class="addtoken"
        @click="addTokenToMetamask()"
      >
        <q-tooltip>Add Token To Metamask</q-tooltip>
      </q-icon>
    </div>
    <send-warnings
      :crossChain="
        selectedNetwork.toUpperCase() !==
        getCurrentChain.NETWORK_NAME.toUpperCase()
      "
      :tokenNotFound="selectedToken === undefined"
      :wrongNetwork="wrongNetwork"
    />

    <send-tx-dialog
      :transaction="transaction"
      :showTransaction.sync="showTransaction"
    />
  </q-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
import amountInput from "src/components/bridge/AmountInput";
import sendTxDialog from "src/components/bridge/SendTxDialog";
import sendWarnings from "src/components/bridge/SendWarnings";
import metamask from "src/components/Metamask";
import { copyToClipboard } from "quasar";
import { ethers } from "ethers";

export default {
  components: { netSelector, amountInput, sendTxDialog, sendWarnings },
  mixins: [metamask],
  props: [
    "selectedTokenSym",
    "selectedNetwork",
    "networkOptions",
    "supportedEvmChains",
  ],
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
      remoteBalance: 0,
      remoteContractInstance: null,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getEvmNetworkByName",
      "getTeleports",
    ]),
    ...mapGetters("blockchains", [
      "getCurrentChain",
      "getNetworkByName",
      "getBridgeTokens",
    ]),
    selectedToken() {
      return this.wallet.find((a) => a.token_sym === this.selectedTokenSym);
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },

    minSend() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (typeof token === "undefined") return 0;
      else return this.$chainToQty(token.min_quantity);
    },

    wrongNetwork() {
      if (this.getEvmNetwork) {
        return (
          this.getEvmNetwork.name.toUpperCase() !==
          this.selectedNetwork.toUpperCase()
        );
      } else return true;
    },

    // shortEvmAccount() {
    //   const address = this.getEvmAccountName;
    //   if (address.length > 0) {
    //     return `${address.slice(0, 6)}...${address.slice(-4)}`;
    //   } else return "";
    // }
  },
  methods: {
    ...mapActions("account", ["setWalletBalances"]),

    // changeNetwork(network) {
    //   this.$emit("update:selectedNetwork", network);
    // },

    async updateBalance() {
      if (this.getEvmChainId && this.getEvmAccountName) {
        const { injectedWeb3, web3 } = await this.$web3();

        if (injectedWeb3) {
          if (this.wrongNetwork) this.remoteBalance = 0;
          else {
            // console.log("ERC20 ABI:", this.$erc20Abi, "Chain data:", chainData);
            const token = this.getTPortTokensBySym(this.selectedTokenSym);
            // console.log("TPort token:", token);
            if (typeof token === "undefined") {
              console.error("TPort Token not found");
            } else {
              const remoteContractAddress = token.remote_contracts.find(
                (el) => el.key === this.getEvmRemoteId
              ).value;
              // console.log("remoteContractAddress:", remoteContractAddress);
              this.remoteContractInstance = new web3.eth.Contract(
                this.$erc20Abi,
                remoteContractAddress
              ); // TODO Add check to validate abi
              //   console.log("remoteInstance:", remoteInstance);
              const balance = await this.remoteContractInstance.methods
                .balanceOf(this.getEvmAccountName)
                .call();
              this.remoteBalance = Number(
                ethers.utils
                  .formatUnits(
                    balance,
                    await this.remoteContractInstance.methods.decimals().call()
                  )
                  .toString()
              );
            }
          }
        }
      }
    },

    async trySend() {
      try {
        await this.send();
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

    async send() {
      // if same network, do normal transaction
      let transaction;
      // If EVM network, teleport
      const actions = [
        {
          account: this.token_contract,
          name: "transfer",
          authorization: [
            {
              actor: this.accountName,
              permission: "active",
            },
          ],
          data: {
            from: this.accountName,
            to: process.env.TPORT_ADDRESS,
            quantity: `${parseFloat(this.amount).toFixed(
              this.token_decimals
            )} ${this.selectedTokenSym}`,
            memo: "Teleport",
          },
        },
        {
          account: process.env.TPORT_ADDRESS,
          name: "teleport",
          authorization: [
            {
              actor: this.accountName,
              permission: "active",
            },
          ],
          data: {
            from: this.accountName,
            quantity: `${parseFloat(this.amount).toFixed(
              this.token_decimals
            )} ${this.selectedTokenSym}`,
            chain_id: this.getEvmRemoteId,
            eth_address:
              this.getEvmAccountName.replace("0x", "") +
              "000000000000000000000000",
          },
        },
      ];
      console.log("Actions: ", actions);

      transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.to = null;
        this.amount = null;
        this.memo = "";
        this.$refs.sendForm.reset();
        this.$refs.sendForm.resetValidation();
        this.setWalletBalances(this.accountName);
        this.$store.dispatch("tport/updateTeleports", this.accountName);
      }
    },

    async addTokenToMetamask() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      let tokenAddress = null;
      // console.log("TPort token:", token);
      if (typeof token === "undefined") {
        console.error("TPort Token not found");
      } else {
        tokenAddress = token.remote_contracts.find(
          (el) => el.key === this.getEvmRemoteId
        ).value;
      }

      try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        const wasAdded = await ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20", // Initially only supports ERC20, but eventually more!
            options: {
              address: tokenAddress, // The address that the token is at.
              symbol: this.selectedTokenSym, // A ticker symbol or shorthand, up to 5 chars.
              decimals: await this.remoteContractInstance.methods
                .decimals()
                .call(), // The number of decimals in the token
              // image: tokenImage // A string url of the token logo
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    },

    copyEvmAccount() {
      copyToClipboard(this.getEvmAccountName).then(() => {
        this.$q.notify({
          color: "green-4",
          textColor: "secondary",
          message: "Copied address to clipboard",
          timeout: 1000,
        });
      });
    },
  },
  async mounted() {
    this.updateBalance();
  },
  watch: {
    async getEvmChainId() {
      this.updateBalance();
    },
    async getEvmAccountName() {
      this.updateBalance();
    },
  },
};
</script>

<style lang="scss" scoped>
.addtoken {
  // padding: 5px 20px 10px 0;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  color: $primary;
  &:hover {
    color: $accent;
  }
}
</style>
