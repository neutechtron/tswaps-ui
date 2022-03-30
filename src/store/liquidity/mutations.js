export const setToken1 = (state, token1) => {
  state.token1 = token1;
};

export const setToken2 = (state, token2) => {
  state.token2 = token2;
};

export const setMemo = (state, memo) => {
  state.memo = memo;
};

export const setValue1 = (state, value1) => {
  if (Number.isNaN(value1)) {
    state.value1 = 0;
  } else {
    state.value1 = value1;
  }
};

export const setValue2 = (state, value2) => {
  if (Number.isNaN(value2)) {
    state.value2 = 0;
  } else {
    state.value2 = value2;
  }
};

export const setPool = (state, pool) => {
  state.pool = pool;
};

export const setHasPool = (state, hasPool) => {
  state.hasPool = hasPool;
};

export const setErrorMsg = (state, errorMsg) => {
  state.errorMsg = errorMsg;
};
