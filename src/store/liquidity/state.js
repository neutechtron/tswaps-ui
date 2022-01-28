export default function () {
    return {
        token1: {
            contract: "token.start",
            symbol: "START",
            amount: 0, // aka `balance` to comply with token store
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
            amount: 0, // aka `balance` to comply with token store
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
        hasPool: false,
        errorMsg: "No pool found",
        protocol: "uniswap",
        amplifier: 0
    };
}
