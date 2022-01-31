export const calculateUniswapOut = function ({ commit, rootGetters, getters }, payload) {
    try {
        const config = rootGetters["pools/getConfig"];
        const pool = getters.getPool
        let swappingFee = (pool.trade_fee + config.protocol_fee) / 10000;
        let amountInWithFee = payload.amount * (1 - swappingFee);
        let reserveFrom = {};
        let reserveTo = {}
        if (payload.reserse) {
            reserveFrom = parseFloat(getters.getToReserve.quantity);
            reserveTo = parseFloat(getters.getFromReserve.quantity);
        } else {
            reserveFrom = parseFloat(getters.getFromReserve.quantity);
            reserveTo = parseFloat(getters.getToReserve.quantity);
        }


        console.log("calculateUniswapOut:", payload.amount, amountInWithFee, reserveFrom, reserveTo);

        let constantProduct = reserveFrom * reserveTo;
        console.log("constantProduct", constantProduct);
        let reserveToAfter =
            constantProduct / (reserveFrom + amountInWithFee);
        console.log("reserveToAfter", reserveToAfter);
        let amountOut = reserveTo - reserveToAfter;
        console.log("amountOut", amountOut);

        amountOut = this.$truncate(amountOut, getters.getToToken.precision);
        return amountOut;
    } catch (error) {
        console.log("calculateUniswapOut", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }

}


export const updateSwapPool = async function ({ commit, rootGetters, getters }) {
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

export const updateAmount = async function ({ commit, getters, dispatch }, amount) {
    try {
        commit("setAmount", amount);
        if (getters.getCanSwap) {
            const pool = getters.getPool;
            let estimate = 0;
            if (pool.protocol === "curve") {
                estimate = await dispatch("calculateUniswapOut", { amount: amount });
            } else {
                estimate = await dispatch("calculateUniswapOut", { amount: amount })
            }
            commit("setToEstimate", estimate);
        } else {
            commit("setToEstimate", 0);
        }
    } catch (error) {
        console.log("Error getting swap pool", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateEstimate = async function (
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
                // TODO curve protocol estimate
                if (pool.protocol === "curve") {
                    amount = await dispatch("calculateUniswapOut", { amount: estimate, reserse: true });
                }
                else {
                    amount = await dispatch("calculateUniswapOut", { amount: estimate, reserse: true })
                }
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

export const createMemo = async function ({ commit, getters }) {
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

export const swapToAndFrom = async function ({ commit, getters, dispatch }) {
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

export const updateSlippage = async function ({ commit }, slippage) {
    try {
        commit("setSlippage", slippage);
    } catch (error) {
        console.log("Error updating slippage", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};
