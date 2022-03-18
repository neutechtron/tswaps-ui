export const setLoadingWallet = (state, wallet) => {
  state.loading = wallet;
};

export const setAccountName = (state, accountName) => {
  state.accountName = accountName;
};

export const setAutoLogin = (state, status) => {
  state.autoLogin = status;
};

export const setProfile = (state, profile = undefined) => {
  if (!profile) {
    return;
  }
  state.profiles[profile.account_name] = profile;
};

export const setWalletToken = (state, { token_sym, token_contract }) => {
  let walletObj = {
    token_sym: token_sym,
    token_contract: token_contract,
    balance: 0,
    liquid: 0,
    unstaking: 0,
    staked: 0,
    unstaking: 0,
    decimals: 0,
    locked: 0,
    claimable: 0,
    ids: [],
    avatar: "",
    stake_maturities: []
  };
  // if token in store update, else push
  if (!state.wallet.map(a => a.token_sym).includes(token_sym)) {
    state.wallet.push(walletObj);
  }
};

export const setWalletTokenBalance = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.balance = amount;
};

export const setWalletTokenLiquid = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.liquid = amount;
};

export const setWalletTokenStaked = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.staked = amount;
};

export const setWalletTokenUnstaking = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.unstaking = amount;
};

export const setWalletTokenLocked = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  if (token) {
    token.locked = amount;
  }
};

export const setWalletTokenClaimable = (state, { token_sym, amount }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  if (token) {
    token.claimable = amount;    
  }
};

export const setWalletTokenIds = (state, { token_sym, ids }) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  if (token) {
    token.ids = ids;    
    state.wallet = [...state.wallet]
  }
};

export const setWalletTokenAvatar = (state, { token_sym, avatar }) => {
  if (state.wallet.find(a => a.token_sym === token_sym).avatar === "") {
    let token = state.wallet.find(a => a.token_sym === token_sym);
    token.avatar = avatar;
  }
};

export const setWalletTokenDecimals = (state, { token_sym, amount }) => {
  if (state.wallet.find(a => a.token_sym === token_sym).decimals === 0) {
    let token = state.wallet.find(a => a.token_sym === token_sym);
    token.decimals = amount;
  }
};

export const setWalletStakeMaturities = (state, { arr }) => {
  let token = state.wallet.find(a => a.token_sym === "START");
  token.stake_maturities = arr;
};

export const resetWalletState = state => {
  state.wallet = [
    {
      token_sym: "START",
      token_contract: "token.start",
      balance: 0,
      liquid: 0,
      staked: 0,
      unstaking: 0,
      decimals: 4,
      avatar:
        "https://raw.githubusercontent.com/T-Starter/T-Starter-images/master/icons/STAR.png",
      stake_maturities: []
    }
  ];
};

export const clearLiquid = state => {
  state.wallet.forEach(element => {
    element.liquid = 0;
  });
};

export const setStakeWallet = (state, { stake_wallet }) => {
  if (!stake_wallet) {
    return;
  }
  state.stakeWallet = stake_wallet;
};

