export const updateSwapPool = async function({ commit, rootGetters, getters }) {
  try {
    const fromToken = getters.getFromToken;
    const toToken = getters.getToToken;
    const pools = rootGetters["pools/getPools"];
    const swapPoolId = fromToken?.toTokens?.find(
      token =>
        token.contract == toToken.contract && token.symbol == toToken.symbol
    )?.pool;
    if (swapPoolId) {
      const pool = pools.find(p => p.id == swapPoolId);
      commit("setPool", pool);
      commit("setCanSwap", true);
      commit("setErrorMsg", "");
    } else {
      commit("setPool", {});
      commit("setCanSwap", false);
      commit("setErrorMsg", "No pool available");
    }
  } catch (error) {
    console.log("Error getting swap pool", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateAmount = async function({ commit, getters }, amount) {
  try {
    commit("setAmount", amount);
    const fromToken = getters.getFromToken;
    if (getters.getCanSwap) {
      let estimate = 0;
      let pool = getters.getPool;
      if (fromToken.symbol == pool?.reserve0?.symbol) {
        estimate = Number(amount) * Number(pool?.price0_last);
      } else {
        estimate = Number(amount) * Number(pool?.price1_last);
      }
      commit("setToEsitmate", estimate);
    } else {
      commit("setToEsitmate", 0);
    }
  } catch (error) {
    console.log("Error getting swap pool", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateEstimate = async function({ commit, getters }) {
  try {
    const amount = getters.getAmount;
    const fromToken = getters.getFromToken;
    if (getters.getCanSwap) {
      let estimate = 0;
      let pool = getters.getPool;
      if (fromToken.symbol == pool?.reserve0?.symbol) {
        estimate = Number(amount) * Number(pool?.price0_last);
      } else {
        estimate = Number(amount) * Number(pool?.price1_last);
      }
      commit("setToEsitmate", estimate);
    } else {
      commit("setToEsitmate", 0);
    }
  } catch (error) {
    console.log("Error getting swap pool", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const createMemo = async function({ commit, getters }) {
  try {
    const estimate = getters.getToEstimate;
    const slippage = getters.getSlippage;
    let minReturn = Number(estimate) - Number(estimate) * Number(slippage);
    minReturn = parseInt(
      parseFloat(minReturn)
        .toFixed(getters.getToToken.precision)
        .toString()
        .replace(".", "")
    );

    const memo = `swap,${minReturn},${getters.getPool.id}`;
    commit("setMemo", memo);
  } catch (error) {
    console.log("Error creating memo", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const swapToAndFrom = async function({ commit, getters }) {
  try {
    const fromToken = getters.getFromToken;
    const toToken = getters.getToToken;
    commit("setFromToken", toToken);
    commit("setToToken", fromToken);
  } catch (error) {
    console.log("Error creating memo", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
