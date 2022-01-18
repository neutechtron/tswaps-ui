export default function() {
  return {
    fromToken: {
      contract: "eosio.token",
      symbol: "TLOS",
      balance: 0,
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: false,
      telosdio: true,
      bridgestart: false
    },
    toToken: {
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
    amount: 0,
    estimate: 0,
    memo: "",
    pool: {},
    slippage: 0.01,
    canSwap: false,
    errorMsg: "No pool found"
  };
}
