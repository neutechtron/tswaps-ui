export default function () {
  return {
    token: {
      contract: "",
      symbol: "Select a token",
      balance: 0,
      precision: 4,
      enabled: true,
      chain: "telos",
      tportstart: true,
      telosdio: false,
      bridgestart: true,
      amount: null,
    },
    amount: 0,
    memo: "",
    fromAccount: "",
    fromChain: {},
    toAccount: "",
    toChain: {},
    toNative: false,
  };
}
