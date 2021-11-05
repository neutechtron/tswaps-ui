export const setTokens = (state, { tokens }) => {
  // TODO check duplicates
  if (state.tokens.length === 0) {
    state.tokens = tokens;
  } else {
    let temp_tokens = state.tokens.concat(tokens);
    const ids = temp_tokens.map(token => token.id);
    const filtered = temp_tokens.filter(({id}, index) => !ids.includes(id, index + 1))
    state.tokens = filtered;
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
  if (new_token !== undefined) {
    new_token.amount = amount;
  } 
};

export const clearTokens = (state) => {
  state.tokens = [];
} 
