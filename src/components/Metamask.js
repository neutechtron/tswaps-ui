/**
 * Mixin for Metamask related functions.
 */

import { mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getEvmNetworkByName",
      "getTeleports"
    ])
  },
  methods: {
    async connectWeb3() {
      // TODO Add metamask onboarding
      // TODO Add metamask connected check
      // TODO Add metamask disconnect refresh
      const { injectedWeb3, web3 } = await this.$web3();
      if (injectedWeb3) {
        const a = await web3.eth.getAccounts();
        this.$store.commit("tport/setAccountName", { accountName: a[0] });
        this.$store.commit("xchain/setAccountName", { accountName: a[0] });
        const chainId = await web3.eth.getChainId();
        this.$store.commit("tport/setChainId", { chainId });
        this.$store.commit("xchain/setChainId", { chainId });

        window.ethereum.on("accountsChanged", a => {
          this.$store.commit("tport/setAccountName", { accountName: a[0] });
          this.$store.commit("xchain/setAccountName", { accountName: a[0] });
        });
        window.ethereum.on("chainChanged", chainId => {
          this.$store.commit("tport/setChainId", { chainId });
          this.$store.commit("xchain/setChainId", { chainId });
        });
      } else {
        console.error("Could not get injected web3");
      }
    },
    async switchMetamaskNetwork(networkName) {
      let chainId = this.getEvmNetworkByName(networkName).chainId;
      chainId = "0x" + chainId.toString(16);
      console.log("switchToSelectedEvm - chainId:", chainId);
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainId }]
        });
      } catch (err) {
        const net = this.getEvmNetworkByName(networkName);
        if (err.code === 4902) {
          // Unrecognized chain ID
          if (net.rpcUrls.length > 0) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainId,
                  chainName: net.chainName,
                  nativeCurrency: net.nativeCurrency,
                  rpcUrls: net.rpcUrls
                }
              ]
            });
          }
        }
      }
    }
  }
};
