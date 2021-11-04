export const setBridgeTokens = (state, { tokens }) => {
  if (state.tokens.length === 0) {
    state.tokens = tokens;
  } else {
    state.tokens = state.tokens.concat(tokens);
  }
};

export const setTelosdioTokens = (state, { tokens }) => {
  if (state.tokens.length === 0) {
    console.log(tokens);
    state.tokens = tokens;
  } else {
    state.tokens = state.tokens.concat(tokens);
  }
};
