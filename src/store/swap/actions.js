export const calculateUniswapOut = function ({ commit, rootGetters, getters }, payload) {
    try {
        const config = rootGetters["pools/getConfig"];
        const pool = getters.getPool
        let swappingFee = (pool.trade_fee + config.protocol_fee) / 10000;
        let reserveFrom = parseFloat(getters.getFromReserve.quantity);
        let reserveTo = parseFloat(getters.getToReserve.quantity);
        if (payload.reverse) {
            // console.log("calculateUniswapOut:", payload.amount, reserveFrom, reserveTo);
            let constantProduct = reserveFrom * reserveTo;
            // console.log("constantProduct", constantProduct);
            let reserveToAfter = reserveTo - payload.amount;
            // console.log("reserveToAfter", reserveToAfter);
            let amountIn = (constantProduct / reserveToAfter) - reserveFrom;
            // console.log("amountIn", amountIn);
            amountIn = this.$truncate(amountIn, getters.getFromToken.precision);
            if (amountIn < 0) {
                amountIn = 0;
            }
            return amountIn;

        } else {
            let amountInWithFee = payload.amount * (1 - swappingFee);
            // console.log("calculateUniswapOut:", payload.amount, amountInWithFee, reserveFrom, reserveTo);
            let constantProduct = reserveFrom * reserveTo;
            // console.log("constantProduct", constantProduct);
            let reserveToAfter =
                constantProduct / (reserveFrom + amountInWithFee);
            // console.log("reserveToAfter", reserveToAfter);
            let amountOut = reserveTo - reserveToAfter;
            // console.log("amountOut", amountOut);
            amountOut = this.$truncate(amountOut, getters.getToToken.precision);
            if (amountOut < 0) {
                amountOut = 0;
            }
            return amountOut;
        }

    } catch (error) {
        console.log("calculateUniswapOut", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }

}

export const calculateCurveOut = async function ({ commit, rootGetters, getters }, payload) {
    try {
        const MAX_ITERATIONS = 10;
        const config = rootGetters["pools/getConfig"];
        const pool = getters.getPool
        let swappingFee = (pool.trade_fee + config.protocol_fee) / 10000;
        let reserveTo = 0
        let reserveFrom = 0
        if (payload.reverse) {
            reserveTo = parseFloat(getters.getFromReserve.quantity);
            reserveFrom = parseFloat(getters.getToReserve.quantity);
        } else {
            reserveFrom = parseFloat(getters.getFromReserve.quantity);
            reserveTo = parseFloat(getters.getToReserve.quantity);
        }

        let amp = pool.amplifier
        let amount = payload.amount

        console.log("calculateCurveOut:", amount, reserveFrom, reserveTo);
        // calculate invariant D by solving quadratic equation:
        // A * sum * n^n + D = A * D * n^n + D^(n+1) / (n^n * prod), where n==2
        const sum = reserveFrom + reserveTo
        let D = sum
        let D_prev = 0

        let i = MAX_ITERATIONS
        while (D !== D_prev && i > 0) {
            let prod1 = D * D / (reserveFrom * 2) * D / (reserveTo * 2)
            D_prev = D
            D = 2 * D * (amp * sum + prod1) / ((2 * amp - 1) * D + 3 * prod1)
            i--
        }
        // console.log("D", D)

        // calculate x - new value for reserve_out by solving quadratic equation iteratively:
        // x^2 + x * (sum' - (An^n - 1) * D / (An^n)) = D ^ (n + 1) / (n^(2n) * prod' * A), where n==2
        // x^2 + b*x = c
        const b = ((reserveFrom + amount) + (D / (amp * 2))) - D
        // console.log("b", b)
        const c = D * D / ((reserveFrom + amount) * 2) * D / (amp * 4)
        // console.log('c', c)
        let x = D, x_prev = 0
        i = MAX_ITERATIONS
        while (x !== x_prev && i > 0) {
            x_prev = x
            x = (x * x + c) / (2 * x + b)
            i--
        }
        // console.log("x", x)

        let amountOut = reserveTo - x
        let amountOutWithFee = amountOut * (1 - swappingFee) || 0
        // console.log("amountOutWithFee", amountOutWithFee)
        if (amountOutWithFee < 0) {
            amountOutWithFee = 0;
        }
        return amountOutWithFee;

    } catch (error) {
        console.log("calculateCurveOut", error);
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
        if (amount <= 0) {
            amount = 0;
        }
        commit("setAmount", amount);
        if (getters.getCanSwap) {
            const tokenPrecision = getters.getToToken.precision
            const pool = getters.getPool;
            let estimate = 0;
            if (pool.protocol === "curve") {
                estimate = await dispatch("calculateCurveOut", { amount: amount });
            } else {
                estimate = await dispatch("calculateUniswapOut", { amount: amount })
            }
            commit("setToEstimate", parseFloat(estimate.toFixed(tokenPrecision)));
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
        if (estimate <= 0) {
            estimate = 0;
        }
        if (estimate === undefined) {
            dispatch("updateAmount", getters.getAmount);
        } else {
            // console.log("setting", estimate);
            commit("setToEstimate", estimate);
            if (getters.getCanSwap) {
                const tokenPrecision = getters.getToToken.precision
                const pool = getters.getPool;
                let amount = getters.getAmount;
                // TODO curve protocol estimate
                if (pool.protocol === "curve") {
                    amount = await dispatch("calculateCurveOut", { amount: estimate, reverse: true });
                }
                else {
                    amount = await dispatch("calculateUniswapOut", { amount: estimate, reverse: true })
                }
                commit("setAmount", parseFloat(amount.toFixed(tokenPrecision)));
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

export const updateToAndFromBalance = async function ({ commit, getters, rootGetters }) {
    try {
        const fromToken = getters.getFromToken;
        const toToken = getters.getToToken;
        const tokens = rootGetters["tokens/getTokens"];
        let newToken = tokens?.find(
            token =>
                token.contract == toToken?.contract && token.symbol == toToken?.symbol
        );
        if (newToken) {
            commit("setToToken", newToken);
        }
        newToken = tokens?.find(
            token =>
                token.contract == fromToken?.contract && token.symbol == fromToken?.symbol
        );
        if (newToken) {
            commit("setFromToken", newToken);
        }
    } catch (error) {
        console.log("Error creating memo", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};