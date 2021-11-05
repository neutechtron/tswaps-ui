export default function() {
  return {
    token: {
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
    amount: 0,
    memo: "",
    fromAccount: "",
    fromChain: {},
    toAccount: "",
    toChain: {}
  };
}
