export const getTokens = ({ tokens }) => tokens;
export const getSwapToken = ({ tokens }) =>
  tokens.filter(
    (token) => token.symbol === "SWAP" && token.contract === "swap.swaps"
  )[0];
export const getTLOSToken = ({ tokens }) =>
  tokens.filter(
    (token) => token.symbol === "TLOS" && token.contract === "eosio.token"
  )[0];
export const getToken =
  ({ tokens }) =>
  (contract, symbol) =>
    tokens.filter(
      (token) => token.symbol === symbol && token.contract === contract
    )[0];
