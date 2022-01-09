export default function() {
  return {
    token1: {
      contract: "token.start",
      symbol: "START",
      balance: 0,
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: true,
      telosdio: false,
      bridgestart: true
    },
    token2: {
      contract: "",
      symbol: "Select a token",
      balance: 0,
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: true,
      telosdio: false,
      bridgestart: true
    },
    value1: 0,
    value2: 0,
    memo: "",
    pool: {},
    slippage: 0.01,
    hasPool: false,
    errorMsg: "No pool found"
  };
}
