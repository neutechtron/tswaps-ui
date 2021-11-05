export const setTokens = (state, { tokens }) => {
  // TODO check duplicates
  if (state.tokens.length === 0) {
    state.tokens = tokens;
  } else {
    state.tokens = state.tokens.concat(tokens);
  }
};


// Set token amount
export const setTokenAmount = (state, { token, amount }) => {
  let new_token = state.tokens.find(
    t =>
      t.symbol === token.symbol &&
      t.contract === token.contract &&
      t.chain === token.chain
  );
  new_token.amount = amount;
};
