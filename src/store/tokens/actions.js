// Get cross chain tokens from tokens table of bridge.start
export const updateBridgeTokens = async function(
  { commit, getters, rootGetters },
  accountName
) {
  try {
    const getCurrentChain = rootGetters[
      "blockchains/getCurrentChain"
    ].NETWORK_NAME.toLowerCase();
    let otherChains = ["telos", "eos", "wax"].filter(
      (value, _index, _arr) => value !== getCurrentChain
    );
    let temp_tokens = [];
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
      temp_tokens.push(...tableResults.rows);
    }
    console.log("Bridge Tokens:", temp_tokens);

    for (const token of temp_tokens) {
      let new_token = {};
      console.log("token:", token.token_info);
      new_token.symbol = this.$exSymToSymbol(token.token_info);
      new_token.contract = this.$exSymToContract(token.token_info);
      new_token.precision = this.$exSymToPrecision(token.token_info);
      new_token.chain = getCurrentChain;
      new_token.enabled = token.enabled;
      new_token.bridgestart = true;
      new_token.tportstart = false;
      new_token.telosdio = false;
      new_token.amount = 0;

      console.log("new_token:", new_token);
      tokens.push(new_token);
    }

    commit("setBridgeTokens", { tokens });

    if (accountName !== null) {
      // TODO get balances
      const rpc = this.$api.getRpc();
      let balance = await rpc.get_currency_balance(
        new_token.contract,
        accountName,
        new_token.symbol
      )[0];
      // console.log("balance:")
      // console.log(balance)
      if (balance !== undefined) {
        new_token.amount = this.$assetToAmount(balance);
      } else {
        new_token.amount = 0;
      }
    }
    
  } catch (error) {
    console.log("Error getting bridge tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTELOSDioTokens = async function(
  { commit, getters, rootGetters },
  accountName
) {
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

    // TODO get balances

    // TODO format tokens

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
export const updateAllTokensBalances = async function(
  { commit, dispatch },
  accountName
) {
  try {
    let tokens = [];
    if (accountName !== null) {
      const userCoins = await this.$hyperion.get(
        `/v2/state/get_tokens?account=${accountName}&limit=1000`
      );
      console.log("user token balances:", userCoins.data.tokens);
      commit("setTokenBalances", { tokens }); //TODO: set token balances
    }
  } catch (error) {
    console.log("Error getting all tokens balances:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
