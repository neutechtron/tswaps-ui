import { ethers } from "ethers";

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

export const updateToChain = async function ({ commit }, chain) {
  try {
    commit("setToChain", chain);
    if (chain.NETWORK_NAME == "TELOS") {
      commit("setToNative", true);
    } else {
      commit("setToNative", false);
    }
  } catch (error) {
    console.log("Error updating bridge chain", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateFromChain = async function ({ commit }, chain) {
  try {
    commit("setFromChain", chain);
  } catch (error) {
    console.log("Error updating bridge chain", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const sendBridgeToken = async function ({
  commit,
  getters,
  rootGetters,
  dispatch,
}) {
  if (getters.getToNative) {
    return dispatch("sendToNative");
  } else {
    return dispatch("sendToEvm");
  }
};

export const sendToEvm = async function ({ commit, getters, rootGetters }) {
  var transaction = null;
  let token = getters.getToken;
  let amount = getters.getAmount;
  let accountName = rootGetters["account/accountName"];
  let evmRemoteId = rootGetters["tport/getEvmRemoteId"];
  let evmAccountName = rootGetters["tport/getEvmAccountName"];
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
        quantity: `${parseFloat(amount).toFixed(token.decimals)} ${
          token.symbol
        }`,
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
        quantity: `${parseFloat(amount).toFixed(token.decimals)} ${
          token.symbol
        }`,
        chain_id: evmRemoteId,
        eth_address:
          evmAccountName.replace("0x", "") + "000000000000000000000000",
      },
    },
  ];
  console.log("Actions: ", actions);

  try {
    transaction = await this.$api.signTransaction(actions);
    console.log(transaction);
    return transaction;
  } catch (error) {
    console.log("Error bridging tokens.", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
    return transaction;
  }
};

export const sendToNative = async function ({ commit, getters, rootGetters }) {
  var transaction = null;
  let token = getters.getToken;
  let amount = getters.getAmount;
  let accountName = rootGetters["account/accountName"];
  let evmRemoteId = rootGetters["tport/getEvmRemoteId"];
  let evmAccountName = rootGetters["tport/getEvmAccountName"];
  let evmChainId = rootGetters["tport/getEvmChainId"];
  if (evmChainId && evmAccountName) {
    const { injectedWeb3, web3 } = await this._vm.$web3();

    if (injectedWeb3) {
      if (typeof token === "undefined") {
        console.error("TPort Token not found");
      } else {
        const remoteContractAddress = token.remote_contracts.find(
          (el) => el.key === evmRemoteId
        ).value;
        const remoteInstance = new web3.eth.Contract(
          this._vm.$erc20Abi,
          remoteContractAddress
        );
        let weiAmount = ethers.utils
          .parseUnits(
            String(amount),
            await remoteInstance.methods.decimals().call()
          )
          .toString();
        console.log("weiAmount:", weiAmount);
        try {
          const resp = await remoteInstance.methods
            .teleport(accountName, weiAmount, 0)
            .send({ from: evmAccountName });
            return {transactionId: resp.transactionHash}
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};
