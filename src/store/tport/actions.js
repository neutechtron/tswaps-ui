// Get evm bridge tokens from tokens table of tport.start
export const setTPortTokens = async function ({ commit, getters }) {
  try {
    let tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: process.env.TPORT_ADDRESS,
      scope: process.env.TPORT_ADDRESS,
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });
    for (let asset of tableResults.rows) {
      asset = {
        ...asset,
        symbol: this.$getSymFromAsset(asset.token),
        decimals: this.$getDecimalFromAsset(asset.token),
        contract: asset.token.contract,
        amount: 0,
      };
      tokens.push(asset);
    }
    commit("updateTPortTokens", { tokens });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const setTeleports = async function ({ commit }, account) {
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
      show_payer: false,
    });

    let teleports = [];
    res.rows.forEach((r) => {
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
    var options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    teleports = teleports
      .map((t) => {
        if (t.date) {
          t.time = new Date(t.date + "Z").valueOf();
          t.displaydate = new Date(t.date + "Z");
        } else {
          t.displaydate = new Date(t.time * 1000).toLocaleDateString(
            "en-US",
            options
          );
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

export const updateTportTokenBalances12 = async function (
  { rootGetters, dispatch },
  injectedWeb3,
  web3,
  erc20abi
) {
  if (rootGetters["bridge/getToNative"]) {
    return dispatch("updateTportTokenBalancesEvm", {
      injectedWeb3,
      web3,
      erc20abi,
    });
  } else {
    return dispatch("updateTportTokenBalancesNative");
  }
};

export const updateTportTokenBalances = async function ({
  commit,
  getters,
  rootGetters,
}) {
  try {
    var accountName = rootGetters["account/accountName"];
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
            let precision = this.$assetToPrecision(balance);
            if (token.token.decimals === 0) {
              commit("setTokenPrecision", {
                token: token,
                precision: precision,
              });
            }
            commit("setTokenAmount", {
              token: token,
              amount: this.$assetToAmount(balance),
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

export const updateTportTokenBalancesEvm = async function (
  { commit, getters, rootGetters },
  injectedWeb3,
  web3,
  erc20abi
) {
  try {
    if (getters.getEvmChainId && getters.getEvmAccountName) {
      console.log("here");
      let tokens = getters.getTPortTokens;
      const balance = 0;
      for (const token of tokens) {
        try {
          if (injectedWeb3) {
            console.log(
              wrongNetwork(
                getters.getEvmNetwork,
                rootGetters["bridge/getFromChain"]
              )
            );
            if (
              wrongNetwork(
                getters.getEvmNetwork,
                rootGetters["bridge/getFromChain"]
              )
            )
              balance = 0;
            else {
              console.log("TPort token:", token);
              if (typeof token === "undefined") {
                console.error("TPort Token not found");
              } else {
                const remoteContractAddress = token.remote_contracts.find(
                  (el) => el.key === getters.getEvmRemoteId
                ).value;
                console.log("remoteContractAddress:", remoteContractAddress);
                const remoteInstance = new web3.eth.Contract(
                  erc20abi,
                  remoteContractAddress
                ); // TODO Add check to validate abi
                console.log("remoteInstance:", remoteInstance);
                const remotebalance = await remoteInstance.methods
                  .balanceOf(getters.getEvmAccountName)
                  .call();
                console.log("Balance is:", balance);
                balance = Number(
                  parseFloat(
                    ethers.utils
                      .formatUnits(
                        remotebalance,
                        await remoteInstance.methods.decimals().call()
                      )
                      .toString()
                  ).toFixed(token.token.decimals)
                );
              }
            }
          }
          console.log("balance:");
          console.log(balance);
          if (balance !== undefined) {
            let precision = this.$assetToPrecision(balance);
            if (token.token.decimals === 0) {
              commit("setTokenPrecision", {
                token: token,
                precision: precision,
              });
            }
            commit("setTokenAmount", {
              token: token,
              amount: this.$assetToAmount(balance),
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

function wrongNetwork(evmNetwork, selectedNetwork) {
  if (evmNetwork) {
    return (
      evmNetwork.name.toUpperCase() !==
      selectedNetwork.NETWORK_NAME.toUpperCase()
    );
  } else return true;
}

export const updateWeb3 = async function ({ commit }, web3, injectedWeb3) {
  commit("setWeb3", web3);
  commit("setInjectedWeb3", injectedWeb3);
};
