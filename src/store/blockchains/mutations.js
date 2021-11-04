export const setCurrentChain = (state, { newChain }) => {
  state.currentChain = newChain;
};

export const updateBridgeTokens = (state, { tokens }) => {
  state.bridgeTokens = tokens;
};
