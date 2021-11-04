export default function() {
  return {
    tokens: [
      {
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
      {
        contract: "eosio.token",
        symbol: "TLOS",
        balance: 0,
        precision: 4,
        enabled: true,
        chain: "telos",
        tportstart: false,
        telosdio: true,
        bridgestart: false
      }
    ]
  };
}
