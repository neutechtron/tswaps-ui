// Get cross chain tokens from tokens table of bridge.start
export const updateBridgeTokens = async function({
  commit,
  getters,
  rootGetters
}) {
  try {
    const getCurrentChain = rootGetters[
      "blockchains/getCurrentChain"
    ].NETWORK_NAME.toLowerCase();
    let otherChains = ["telos", "eos", "wax"].filter(
      (value, _index, _arr) => value !== getCurrentChain
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
    console.log("Bridge Tokens:", tokens);
    commit("setBridgeTokens", { tokens });
  } catch (error) {
    console.log("Error getting bridge tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTELOSDioTokens = async function({
  commit,
  getters,
  rootGetters
}) {
  try {
    let tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: "telosd.io",
      scope: "telosd.io",
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    tokens.push(...tableResults.rows);
    // return res;
    console.log("TLOSDio Tokens:", tokens);
    // commit("setTLOSDioTokens", { tokens });  // TODO: update store
  } catch (error) {
    console.log("Error getting bridge tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
