export default function () {
  return {
    fromToken: {
      contract: "",
      symbol: "Select a token",
      amount: 0, // aka `balance` to comply with token store
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: false,
      telosdio: true,
      bridgestart: false,
      toTokens: [],
    },
    toToken: {
      contract: "",
      symbol: "Select a token",
      amount: 0, // aka `balance` to comply with token store
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: true,
      telosdio: false,
      bridgestart: true,
      fromTokens: [],
    },
    amount: 0,
    estimate: 0,
    memo: "",
    pool: {},
    slippage: 0.01,
    canSwap: false,
    errorMsg: "No pool found",
    recentTransactions: [],
  };
}
