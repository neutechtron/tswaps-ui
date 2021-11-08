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
    let temp_tokens = [];
    let tokens = [];
    for (let chain of otherChains) {
      // console.log("rpc", this.$api.getRpc())
      const tableResults = await this.$api.getTableRows({
        code: process.env.BRIDGE_ADDRESS,
        scope: chain,
        table: "tokens",
        limit: 10000,
        reverse: false,
        show_payer: false
      });
      // console.log("tableResults", tableResults);
      temp_tokens.push(...tableResults.rows);
    }
    console.log("bridge tokens", temp_tokens);

    for (const token of temp_tokens) {
      let new_token = {};
      new_token.symbol = this.$exSymToSymbol(token.token_info);
      new_token.contract = this.$exSymToContract(token.token_info);
      new_token.precision = this.$exSymToPrecision(token.token_info);
      new_token.min_quantity = this.$assetToAmount(token.min_quantity);
      new_token.chain = getCurrentChain;
      new_token.enabled = token.enabled;
      new_token.bridgestart = true;
      new_token.tportstart = false;
      new_token.telosdio = false;
      new_token.amount = 0;
      new_token.toChain = [token.channel];
      new_token.id = `${new_token.contract}-${new_token.symbol}-${new_token.chain}`;

      // Check duplicates
      if (
        tokens.find(
          t =>
            t.symbol === new_token.symbol &&
            t.chain === new_token.chain &&
            t.contract === new_token.contract &&
            !t.toChain.includes(new_token.toChain)
        )
      ) {
        // append toChain
        let index = tokens.findIndex(
          t =>
            t.symbol === new_token.symbol &&
            t.chain === new_token.chain &&
            t.contract === new_token.contract
        );
        tokens[index].toChain.push(token.channel);
      } else {
        tokens.push(new_token);
      }
    }

    commit("setTokens", { tokens });
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
    const getCurrentChain = rootGetters[
      "blockchains/getCurrentChain"
    ].NETWORK_NAME.toLowerCase();
    let tokens = [];
    let temp_tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: "telosd.io",
      scope: "telosd.io",
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    temp_tokens.push(...tableResults.rows);
    console.log("TELOSDio Tokens:", temp_tokens);

    for (const token of temp_tokens) {
      let new_token = {};
      new_token.symbol = this.$exSymToSymbol(token.token_info);
      new_token.contract = this.$exSymToContract(token.token_info);
      new_token.precision = this.$exSymToPrecision(token.token_info);
      new_token.min_quantity = this.$assetToAmount(token.min_quantity);
      new_token.chain = getCurrentChain;
      new_token.enabled = token.enabled;
      new_token.bridgestart = false;
      new_token.tportstart = false;
      new_token.telosdio = true;
      new_token.amount = 0;
      new_token.toChain = [token.remote_chain];
      new_token.id = `${new_token.contract}-${new_token.symbol}-${new_token.chain}`;

      tokens.push(new_token);
    }

    commit("setTokens", { tokens });
  } catch (error) {
    console.log("Error getting telosdio tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTokenBalances = async function(
  { commit, getters },
  accountName
) {
  try {
    if (accountName !== null) {
      let tokens = getters.getTokens;
      const rpc = this.$api.getRpc();
      for (const token of tokens) {
        try {
          let balance = (
            await rpc.get_currency_balance(
              token.contract,
              accountName,
              token.symbol
            )
          )[0];
          // console.log("balance:")
          // console.log(balance)
          if (balance !== undefined) {
            commit("setTokenAmount", {
              token: token,
              amount: this.$assetToAmount(balance)
            });
          } else {
            commit("setTokenAmount", { token: token, amount: 0 });
          }
        } catch (error) {
          commit("setTokenAmount", { token: token, amount: 0 });
        }
      }
    }
  } catch (error) {
    console.log("Error getting chain token balance:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
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
