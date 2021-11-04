import hyperion from "src/boot/hyperion";

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
    console.log("TELOSDio Tokens:", tokens);
    commit("setTelosdioTokens", { tokens });
  } catch (error) {
    console.log("Error getting telosdio tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get balance from chain for given address and token
export const getChainTokenBalance = async function({ commit }, payload) {
  try {
    const rpc = this.$api.getRpc();
    console.log(
      await rpc.get_currency_balance(
        payload.address,
        payload.accountName,
        payload.sym
      )
    );
    if (payload.accountName !== null) {
      let balance = (
        await rpc.get_currency_balance(
          payload.address,
          payload.accountName,
          payload.sym
        )
      )[0];
      // console.log("balance:")
      // console.log(balance)
      if (balance !== undefined) {
        return balance;
      } else {
        return `0 ${payload.sym}`;
      }
    }
  } catch (error) {
    console.log("Error getting chain token balance:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
    return `0 ${payload.sym}`;
  }
};

// Update all tokens balances
export const updateAllTokensBalances = async function({ commit, dispatch }, accountName) {
  try {
    let tokens = [];
    if (accountName !== null) {
      const userCoins = await this.$hyperion.get(
        `/v2/state/get_tokens?account=${accountName}&limit=1000`
      );
      console.log("user token balances:", userCoins.data.tokens);
      commit("setTokenBalances", { tokens });
    }
  } catch (error) {
    console.log("Error getting all tokens balances:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
