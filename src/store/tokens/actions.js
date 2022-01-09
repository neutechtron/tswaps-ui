// Get tokens from tokens table 
export const updateTokens = async function({
  commit,
  rootGetters
}) {
  try {
    const getCurrentChain = rootGetters[
      "blockchains/getCurrentChain"
    ].NETWORK_NAME.toLowerCase();
    let pools = [];
    let tokens = [];

    const tableResults = await this.$api.getTableRows({
      code: "nottswapsioa",
      scope: "nottswapsioa",
      table: "pairs",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    // console.log("tableResults", tableResults);
    pools.push(...tableResults.rows);

    for (const pool of pools) {

      let res0 = pool.reserve0
      let res1 = pool.reserve1

      let token0 = {
        symbol: this.$exSymToSymbol(res0),
        contract: res0.contract,
        presision: this.$exSymToPrecision(res0),
        chain: getCurrentChain,
        toTokens: []
      }

      let token1 = {
        symbol: this.$exSymToSymbol(res1),
        contract: res1.contract,
        presision: this.$exSymToPrecision(res1),
        chain: getCurrentChain,
        toTokens: []
      }

     // Check duplicates for token0
      if (
        tokens.find(
          t =>
            t.symbol === token0.symbol &&
            t.chain === token0.chain &&
            t.contract === token0.contract 
        )
      ) {
        // append toToken
        let index = tokens.findIndex(
          t =>
            t.symbol === token0.symbol &&
            t.chain === token0.chain &&
            t.contract === token0.contract 
        );
        tokens[index].toTokens.push({
          contract: token1.contract,
          symbol: token1.symbol,
          precision: token1.presision,
          pool: pool.id
        });
      } else {
        token0.toTokens.push({
          contract: token1.contract,
          symbol: token1.symbol,
          precision: token1.presision,
          pool: pool.id
        });
        tokens.push(token0);
      }

      // Check duplicates for token1
      if (
        tokens.find(
          t =>
            t.symbol === token1.symbol &&
            t.chain === token1.chain &&
            t.contract === token1.contract 
        )
      ) {
        // append toToken
        let index = tokens.findIndex(
          t =>
            t.symbol === token1.symbol &&
            t.chain === token1.chain &&
            t.contract === token1.contract 
        );
        tokens[index].toTokens.push({
          contract: token0.contract,
          symbol: token0.symbol,
          precision: token0.presision,
          pool: pool.id
        });
      } else {
        token1.toTokens.push({
          contract: token0.contract,
          symbol: token0.symbol,
          precision: token0.presision,
          pool: pool.id
        });
        tokens.push(token1);
      }
    }

    commit("setTokens", { tokens });

  } catch (error) {
    console.log("Error getting tokens:", error);
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
