// Get cross chain tokens from tokens table of bridge.start
export const setBridgeTokens = async function({ commit, getters, rootGetters }) {
    try {
      const currentChain = rootGetters["blockchains/currentChain"].NETWORK_NAME.toLowerCase();
      let otherChains = ["telos", "eos", "wax"].filter(
        (value, _index, _arr) => value !== currentChain
      );
      let tokens = [];
      for (let chain of otherChains) {
        const tableResults = await this.$api.getTableRows({
          code: process.env.BRIDGE_ADDRESS,
          scope: chain,
          table: "tokens",
          limit: 10000,
          reverse: false,
          show_payer: false
        });
        tokens.push(...tableResults.rows);
      }
      // return res;
      // console.log("Bridge Tokens:", tokens);
      commit("updateBridgeTokens", { tokens });
    } catch (error) {
      console.log("Error getting bridge tokens:", error);
      commit("general/setErrorMsg", error.message || error, { root: true });
    }
  };