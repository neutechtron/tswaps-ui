export const getFromToken = ({ fromToken }) => fromToken;
export const getToToken = ({ toToken }) => toToken;
export const getAmount = ({ amount }) => amount;
export const getMemo = ({ memo }) => memo;
export const getToEstimate = ({ estimate }) => estimate;
export const getCanSwap = ({ canSwap }) => canSwap;
export const getPool = ({ pool }) => pool;
export const getSlippage = ({ slippage }) => slippage;
export const getIsValidPair = ({ fromToken, toToken }) => {
    return (
        fromToken.toTokens.filter(el => el.symbol == toToken.symbol).length > 0
    );
};
