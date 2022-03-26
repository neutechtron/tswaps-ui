export const updateBridgeToken = async function ({ commit }, token) {
  try {
      commit("setToken", token);
  } catch (error) {
      console.log("Error updating bridge token", error);
      commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateAmount = async function ({ commit }, amount) {
  try {
      commit("setAmount", amount);
  } catch (error) {
      console.log("Error updating bridge amount", error);
      commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const sendBridgeToken = async function({commit, getters, rootGetters}) {
  var transaction = null;
  let token = getters.getToken;
  let amount = getters.getAmount;
  let accountName =  rootGetters["account/accountName"];
  let evmRemoteId =  rootGetters["tport/getEvmRemoteId"];
  let evmAccountName =  rootGetters["tport/getEvmAccountName"];
  const actions = [
    {
      account: token.contract,
      name: "transfer",
      authorization: [
        {
          actor: accountName,
          permission: "active",
        },
      ],
      data: {
        from: accountName,
        to: process.env.TPORT_ADDRESS,
        quantity: `${parseFloat(amount).toFixed(
          token.decimals
        )} ${token.symbol}`,
        memo: "Teleport",
      },
    },
    {
      account: process.env.TPORT_ADDRESS,
      name: "teleport",
      authorization: [
        {
          actor: accountName,
          permission: "active",
        },
      ],
      data: {
        from: accountName,
        quantity: `${parseFloat(amount).toFixed(
          token.decimals
        )} ${token.symbol}`,
        chain_id: evmRemoteId,
        eth_address:
          evmAccountName.replace("0x", "") +
          "000000000000000000000000",
      },
    },
  ];
  console.log("Actions: ", actions);

  try {
    transaction = await this.$api.signTransaction(actions);
    console.log(transaction)
    return transaction;
  } catch (error) {
    console.log("Error bridging tokens.", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
    return transaction;
  }
}