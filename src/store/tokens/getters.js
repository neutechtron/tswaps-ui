export const getTokens = ({ tokens }) => tokens;
export const getSwapToken = ({ tokens }) => tokens.filter(token => token.symbol === 'SWAP' && token.contract === 'swap.swaps');
