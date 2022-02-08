export const setTokens = (state, { tokens }) => {
    state.tokens = tokens;
};

// Set token precision
export const setTokenLogo = (state, { token, logo }) => {
    let new_token = state.tokens.find(
        t =>
            t.symbol === token.symbol &&
            t.contract === token.contract &&
            t.chain === token.chain
    );
    if (new_token !== undefined) {
        new_token.logo = logo;
    }
};


// Set token precision
export const setTokenPrecision = (state, { token, precision }) => {
    let new_token = state.tokens.find(
        t =>
            t.symbol === token.symbol &&
            t.contract === token.contract &&
            t.chain === token.chain
    );
    if (new_token !== undefined) {
        new_token.precision = precision;
    }
};

// Set token amount
export const setTokenAmount = (state, { token, amount }) => {
    let new_token = state.tokens.find(
        t =>
            t.symbol === token.symbol &&
            t.contract === token.contract &&
            t.chain === token.chain
    );
    if (new_token !== undefined) {
        new_token.amount = amount;
    }
    state.tokens = state.tokens.sort((a, b) => (b.amount - a.amount))
};

export const setUsdPrice = (state, { token, price }) => {
    let new_token = state.tokens.find(
        t =>
            t.symbol === token.symbol &&
            t.contract === token.contract &&
            t.chain === token.chain
    );
    if (new_token !== undefined) {
        new_token.UsdPrice = price;
    }
}

export const clearTokens = (state) => {
    state.tokens = [];
} 
