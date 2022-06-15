<template>
  <div class="q-gutter-y-sm self-stretch">
    <div class="input-outline row items-center">
      <div class="col-2 text-h6">{{ this.isFrom ? "From " : "To " }}</div>

      <div class="col-sm-6 col-xs-10">
        <net-selector
          :selectedNetwork="selectedNetwork"
          :networkOptions="networkOptions"
          :isFrom="this.isFrom"
          @changeNetwork="$emit('update:selectedNetwork', $event)"
        />
      </div>
      <div class="col-sm-4 col-xs-12">
        <div class="row justify-center">
          <q-btn
            v-if="
              (!getEvmAccountName || getEvmAccountName === '') && !this.isNative && metaMaskPresent() == true
            "
            label="CONNECT WALLET"
            @click="
              connectWeb3();
              switchMetamaskNetwork(selectedNetwork);
            "
            class="hover-accent"
            color="positive"
            outline
            no-shadow
            no-caps
          />
          <q-btn
            v-else-if="
              (!getEvmAccountName || getEvmAccountName === '') && !this.isNative && metaMaskPresent() == false
            "
            label="CONNECT WALLET"
            @click="
              showMeta
            "
            class="hover-accent"
            color="positive"
            outline
            no-shadow
            no-caps
          />
          <q-btn
            v-else-if="!this.isAuthenticated && this.isNative"
            label="CONNECT WALLET"
            @click="showLogin = !showLogin"
            class="hover-accent"
            color="positive"
            outline
            no-shadow
            no-caps
          />
          <div
            class="evm-account col ellipsis cursor-pointer bordered text-center"
            style="max-width: 200px"
            v-else-if="this.isAuthenticated && this.isNative"
            @click="logout"
          >
            Disconnect
          </div>
          <div
            class="evm-account col ellipsis cursor-pointer bordered text-center"
            style="max-width: 200px"
            v-else-if="getEvmAccountName != '' && !this.isNative"
            @click="setEthAccountName"
          >
            Disconnect
          </div>
        </div>
      </div>
    </div>
    <ual-dialog :showLogin.sync="showLogin" />
    <no-meta-mask-dialog
      :showNoMeta.sync="showNoMeta"
      @changeShowNoMeta="showNoMeta = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "./NetSelector";
import metamask from "src/components/Metamask";
import { copyToClipboard } from "quasar";
import { ethers } from "ethers";
import UalDialog from "src/components/UalDialog.vue";
import NoMetaMaskDialog from "./NoMetaMaskDialog.vue";

export default {
  components: { netSelector, UalDialog, NoMetaMaskDialog },
  mixins: [metamask],
  props: [
    "selectedTokenSym",
    "selectedNetwork",
    "networkOptions",
    "supportedEvmChains",
    "isFrom",
    "isNative",
  ],
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
      remoteBalance: 0,
      remoteContractInstance: null,
      showLogin: false,
      showNoMeta: false,
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
    ...mapActions("account", ["setWalletBalances", "logout"]),
    ...mapActions("tport", ["setAccountName", "updateTportTokenBalances"]),

    // changeNetwork(network) {
    //   this.$emit("update:selectedNetwork", network);
    // },

    showMeta(){
      console.log(this.showNoMeta);
      this.showNoMeta = true; 
    },
    
    metaMaskPresent(){
      if ( typeof web3 === 'undefined' ){
        return false;
      }
      else {
        return true;
      }
    },

    async updateBalance() {
      const { injectedWeb3, web3 } = await this.$web3();
      this.updateTportTokenBalances();
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

    setEthAccountName() {
      this.$store.commit("tport/setAccountName", { accountName: "" });
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

.bordered {
  border: 2px solid $primary;
  border-radius: 15px;
  padding: 5px;
}
</style>
