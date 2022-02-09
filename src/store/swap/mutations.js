export const setFromToken = (state, fromToken) => {
    state.fromToken = fromToken;
};

export const setToToken = (state, toToken) => {
    state.toToken = toToken;
};

export const setMemo = (state, memo) => {
    state.memo = memo;
};

export const setAmount = (state, amount) => {
    if (Number.isNaN(amount)) {
        state.amount = 0;
    } else {
        state.amount = amount;
    }
};

export const setPool = (state, pool) => {
    state.pool = pool;
};

export const setCanSwap = (state, canSwap) => {
    state.canSwap = canSwap;
};

export const setErrorMsg = (state, errorMsg) => {
    state.errorMsg = errorMsg;
};

export const setToEstimate = (state, estimate) => {
    if (Number.isNaN(estimate)) {
        state.estimate = 0;
    } else {
        state.estimate = estimate;
    }
};

export const setSlippage = (state, slippage) => {
    state.slippage = slippage;
};

export const setAddRecentTx = (state, tx) => {
    state.recentTransactions.push(tx);
};
