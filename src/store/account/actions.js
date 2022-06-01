import { Api, JsonRpc } from "eosjs";

export const login = async function (
  { commit, dispatch },
  { idx, account, returnUrl }
) {
  const authenticator = this.$ual.authenticators[idx];
  try {
    commit("setLoadingWallet", authenticator.getStyle().text);
    await authenticator.init();
    if (!account) {
      const requestAccount = await authenticator.shouldRequestAccountName();
      if (requestAccount) {
        await dispatch("fetchAvailableAccounts", idx);
        commit("setRequestAccount", true);
        return;
      }
    }
    const users = await authenticator.login(account);
    if (users.length) {
      const account = users[0];
      const accountName = await account.getAccountName();
      this.$ualUser = account;
      this.$type = "ual";
      commit("setAccountName", accountName);
      localStorage.setItem("autoLogin", authenticator.constructor.name);
      localStorage.setItem("account", accountName);
      localStorage.setItem("returning", true);
      // dispatch("getAccountProfile");
    }
  } catch (e) {
    const error =
      (authenticator.getError() && authenticator.getError().message) ||
      e.message ||
      e.reason;
    commit("general/setErrorMsg", error, { root: true });
    console.log("Login error: ", error);
  } finally {
    commit("setLoadingWallet");
  }
};

export const autoLogin = async function ({ dispatch, commit }, returnUrl) {
  const { authenticator, idx } = getAuthenticator(this.$ual);
  if (authenticator) {
    commit("setAutoLogin", true);
    await dispatch("login", {
      idx,
      returnUrl,
      account: localStorage.getItem("account"),
    });
    commit("setAutoLogin", false);
  }
};

const getAuthenticator = function (ual, wallet = null) {
  wallet = wallet || localStorage.getItem("autoLogin");
  const idx = ual.authenticators.findIndex(
    (auth) => auth.constructor.name === wallet
  );
  return {
    authenticator: ual.authenticators[idx],
    idx,
  };
};

export const logout = async function ({ commit }) {
  const { authenticator } = getAuthenticator(this.$ual);
  try {
    authenticator && (await authenticator.logout());
  } catch (error) {
    console.log("Authenticator logout error", error);
  }
  commit("setProfile", undefined);
  commit("setAccountName");
  this.$type = "";
  localStorage.removeItem("autoLogin");

  if (this.$router.currentRoute.path !== "/") {
    this.$router.push({ path: "/bridge" });
    this.$router.go();
  }
};

export const getUserProfile = async function ({ commit }, accountName) {
  try {
    const profileResult = await this.$api.getTableRows({
      code: "profiles",
      scope: "profiles",
      table: "profiles",
      limit: 1,
      index_position: 1,
      key_type: "i64",
      lower_bound: accountName,
      upper_bound: accountName,
    });

    const profile = profileResult.rows[0];
    commit("setProfile", profile);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getAccountProfile = async function ({ commit, dispatch }) {
  if (!this.state.account.accountName) {
    return;
  }

  dispatch("getUserProfile", this.state.account.accountName);
};

export const accountExists = async function (
  { commit, dispatch },
  accountName
) {
  try {
    const account = await this.$api.getAccount(accountName);
    return !!account;
  } catch (e) {
    return false;
  }
};

export const accountExistsOnChain = async function (
  { commit, dispatch, rootGetters },
  payload
) {
  // get current selected chain
  let blockchains = rootGetters["blockchains/getNetworkByName"](
    payload.network.toUpperCase()
  );
  let newChain = {};

  // check if testnet or not
  if (process.env.TESTNET == "true") {
    newChain = blockchains.find((el) => el.TEST_NETWORK === true);
  } else {
    newChain = blockchains.find((el) => el.TEST_NETWORK === false);
  }
  // console.log(newChain)

  //set rpc
  const rpc = new JsonRpc(
    `${newChain.NETWORK_PROTOCOL}://${newChain.NETWORK_HOST}:${newChain.NETWORK_PORT}`
  );
  //check if account exists on chain
  let exists = await rpc.get_account(payload.account);
  return exists;
};

// get contract wallet table info for user
export const getChainWalletTable = async function (
  { commit, getters, dispatch },
  account
) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: account, // Account that owns the data
      table: "wallets", // Table name
      limit: 10000,
      reverse: false, // Optional: Get reversed data
      show_payer: false, // Optional: Show ram payer
    });

    let contractWalletTbl = tableResults.rows;
    // console.log(contractWalletTbl)

    // Set each token on state
    for (const token_info of contractWalletTbl) {
      let token_sym = this.$chainToSym(token_info.balance);
      let token_liquid = this.$chainToQty(token_info.balance);
      let token_contract = token_info.contract;

      commit("setWalletToken", {
        token_sym: token_sym,
        token_contract: token_contract,
      });
      commit("setWalletTokenLiquid", {
        token_sym: token_sym,
        amount: token_liquid,
      });
      commit("setWalletTokenDecimals", {
        token_sym: token_sym,
        amount: this.$chainToDecimals(token_info.balance),
      });
    }
  } catch (error) {
    console.error("getChainWalletTable");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// reset wallet
export const resetWallet = async function ({ commit, getters, dispatch }) {
  commit("resetWalletState");
};

// reload all wallet info
export const reloadWallet = async function ({ dispatch }, account) {
  // console.log({ account });
};

// reset liquid
export const resetLiquid = async function ({ commit, getters, dispatch }) {
  commit("clearLiquid");
};

// get account stake informations. (Outputs: account, last_claim_id,	stake_balance,	tier,	tier_history)
export const getChainAccountStakeInfo = async function (
  { commit, getters, dispatch },
  account
) {
  try {
    if (account !== null) {
      const accountsResult = await this.$api.getTableRows({
        code: process.env.STAKE_ADDRESS, // Contract that we target
        scope: process.env.STAKE_ADDRESS, // Account that owns the data
        table: "accounts", // Table name
        limit: 1,
        lower_bound: account,
        upper_bound: account,
        reverse: false,
        show_payer: false,
      });
      // console.log(accountsResult.rows[0]);

      if (accountsResult.rows[0] !== undefined) {
        return accountsResult.rows[0];
      } else {
        return {};
      }
    } else {
      return {};
    }
  } catch (error) {
    console.error("getChainAccountStakeInfo");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get account stake informations. (Outputs: id (key) threshold	members	weight	discount)
export const getChainTiersTable = async function ({
  commit,
  getters,
  dispatch,
}) {
  try {
    const tiersTable = await this.$api.getTableRows({
      code: process.env.STAKE_ADDRESS, // Contract that we target
      scope: process.env.STAKE_ADDRESS, // Account that owns the data
      table: "tiers", // Table name
      limit: 10,
      reverse: false,
      show_payer: false,
    });

    if (tiersTable.rows.length > 0) {
      // console.log(tiersTable.rows);
      return tiersTable.rows;
    } else {
      return [];
    }
  } catch (error) {
    console.error("getChainTiersTable");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
