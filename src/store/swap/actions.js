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
    if (getters.getCanSwap) {
      const fromToken = getters.getFromToken;
      const pool = getters.getPool;
      let estimate = 0;
      if (fromToken.symbol == pool?.reserve0?.symbol) {
        estimate = Number(amount) * Number(pool?.price0_last);
      } else {
        estimate = Number(amount) * Number(pool?.price1_last);
      }
      estimate = this.$truncate(estimate, getters.getToToken.precision);
      commit("setToEstimate", estimate);
    } else {
      commit("setToEstimate", 0);
    }
  } catch (error) {
    console.log("Error getting swap pool", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateEstimate = async function(
  { commit, dispatch, getters },
  estimate
) {
  try {
    if (estimate === undefined) {
      dispatch("updateAmount", getters.getAmount);
    } else {
      // console.log("setting", estimate);
      commit("setToEstimate", estimate);
      if (getters.getCanSwap) {
        const toToken = getters.getToToken;
        const pool = getters.getPool;
        let amount = getters.getAmount;
        if (toToken.symbol == pool?.reserve0?.symbol) {
          amount = Number(estimate) * Number(pool?.price0_last);
        } else {
          amount = Number(estimate) * Number(pool?.price1_last);
        }
        amount = this.$truncate(amount, getters.getFromToken.precision);
        commit("setAmount", amount);
      } else {
        // commit("setToEstimate", 0);
      }
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

export const swapToAndFrom = async function({ commit, getters, dispatch }) {
  try {
    const fromToken = getters.getFromToken;
    const toToken = getters.getToToken;
    const amount = getters.getAmount;
    const estimate = getters.getToEstimate;
    commit("setFromToken", toToken);
    commit("setToToken", fromToken);
    commit("setAmount", estimate);
    commit("setToEstimate", amount);
  } catch (error) {
    console.log("Error creating memo", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateSlippage = async function({ commit }, slippage) {
  try {
    commit("setSlippage", slippage);
  } catch (error) {
    console.log("Error updating slippage", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
