// Get evm bridge tokens from tokens table of tport.start
export const setTPortTokens = async function({ commit, getters }) {
  try {
    let tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: process.env.TPORT_ADDRESS,
      scope: process.env.TPORT_ADDRESS,
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    for (let asset of tableResults.rows) {
      asset = {
        ...asset,
        symbol: this.$getSymFromAsset(asset.token),
        decimals: this.$getDecimalFromAsset(asset.token),
        contract: asset.token.contract,
        amount: 0
      };
      tokens.push(asset);
    }
    commit("updateTPortTokens", { tokens });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const setTeleports = async function({ commit }, account) {
  try {
    let res = await this.$api.getTableRows({
      code: process.env.TPORT_ADDRESS,
      scope: process.env.TPORT_ADDRESS,
      table: "teleports",
      key_type: "i64",
      index_position: 2,
      lower_bound: account,
      upper_bound: account,
      limit: 10000,
      reverse: false,
      show_payer: false
    });

    let teleports = [];
    res.rows.forEach(r => {
      r.processing = r.oracles.length <= 1;
      teleports.push(r);
    });
    // res = await this.$api.getTableRows({
    //   code: process.env.TPORT_ADDRESS,
    //   scope: process.env.TPORT_ADDRESS,
    //   table: "receipts",
    //   index_position: 3,
    //   key_type: "i64",
    //   lower_bound: account,
    //   upper_bound: account,
    //   reverse: true
    // });
    // console.log("resEth", res);
    // res.rows.forEach(r => {
    //   r.class = "fromevm";
    //   teleports.push(r);
    // });

    /*
    {
    "code": 3040007,
    "name": "invalid_ref_block_exception",
    "what": "Invalid Reference Block",
    "details": [
        {
            "message": "Transaction's reference block did not match. Is this transaction from a different fork?",
            "file": "controller.cpp",
            "line_number": 3167,
            "method": "validate_tapos"
        }
      ]
    }
    */
    var options = { year: 'numeric', month: 'short', day: 'numeric' , hour: 'numeric', minute: 'numeric'};
    teleports = teleports
      .map(t => {
        if (t.date) {
          t.time = new Date(t.date + "Z").valueOf();
          t.displaydate = new Date(t.date + "Z");
        } else {
          t.displaydate = new Date(t.time ).toLocaleDateString("en-US", options);
        }
        return t;
      })
      .sort((a, b) => (a.time < b.time ? 1 : -1));

    // console.log("Teleports:", teleports);
    commit("updateTeleports", { teleports });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTportTokenBalances = async function (
  { commit, getters },
  accountName
) {
  try {
      if (accountName !== null) {
          let tokens = getters.getTPortTokens;
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
                      let precision = this.$assetToPrecision(balance)
                      if (token.token.decimals === 0) {
                          commit("setTokenPrecision", {
                              token: token,
                              precision: precision
                          });
                      }
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