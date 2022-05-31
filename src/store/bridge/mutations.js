export const setToken = (state, token) => {
  state.token = token;
};

export const setFromChain = (state, chain) => {
  state.fromChain = chain;
};

export const setToChain = (state, chain) => {
  state.toChain = chain;
};

export const setMemo = (state, memo) => {
  state.memo = memo;
};

export const setAmount = (state, amount) => {
  state.amount = amount;
};

export const setToAccount = (state, toAccount) => {
  state.toAccount = toAccount;
};

export const setToNative = (state, flag) => {
  state.toNative = flag;
};

export const resetToken = (state) => {
  state.token = {
    contract: "",
    symbol: "Select a token",
    balance: 0,
    precision: 4,
    enabled: true,
    chain: "telos",
    tportstart: true,
    telosdio: false,
    bridgestart: true,
    amount: null,
  };
};
