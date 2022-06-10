export function setAccountName(state, payload) {
    state.accountName = payload.accountName;
}

export function setChainId(state, payload) {
    let chainId = `${payload.chainId}`;
    if (chainId.substr(0, 2) === "0x") {
        chainId = parseInt(chainId.substr(2), 16);
    } else chainId = parseInt(chainId);
    state.chainId = chainId;
}

export function setNetworkList(state, { networkList }) {
    state.networkList = networkList;
}

export function setTPortTokens(state, { tokens }) {
    state.tportTokens = tokens;
}

export function setTeleports(state, { teleports }) {
    state.teleports = teleports;
}

export function setEvmTransactions(state, { transactions }) {
    state.evmTransactions = transactions;
}

export const setTokenAmount = (state, { token, amount }) => {
    let new_token = state.tportTokens.find(
        (t) => t.symbol === token.symbol && t.contract === token.contract
    );
    if (new_token !== undefined) {
        new_token.amount = amount;
    }
    state.tportTokens = state.tportTokens.sort((a, b) => b.amount - a.amount);
};
