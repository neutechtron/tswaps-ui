export const getFromToken = ({ fromToken }) => fromToken;
export const getToToken = ({ toToken }) => toToken;
export const getAmount = ({ amount }) => amount;
export const getMemo = ({ memo }) => memo;
export const getToEstimate = ({ estimate }) => estimate;
export const getCanSwap = ({ canSwap }) => canSwap;
export const getPool = ({ pool }) => pool;
export const getSlippage = ({ slippage }) => slippage;
export const getRecentTransactions = ({ recentTransactions }) =>
  recentTransactions;
export const getIsValidPair = ({ fromToken, toToken }) => {
  return (
    fromToken.toTokens.filter(
      (el) => el.symbol == toToken.symbol && el.contract == toToken.contract
    ).length > 0
  );
};
export const getFromReserve = ({ fromToken, pool }) => {
  if (
    pool?.reserve0?.contract == fromToken?.contract &&
    pool?.reserve0?.symbol == fromToken?.symbol
  ) {
    return pool?.reserve0;
  } else {
    return pool?.reserve1;
  }
};
export const getToReserve = ({ toToken, pool }) => {
  if (
    pool?.reserve0?.contract == toToken?.contract &&
    pool?.reserve0?.symbol == toToken?.symbol
  ) {
    return pool?.reserve0;
  } else {
    return pool?.reserve1;
  }
};
