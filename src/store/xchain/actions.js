// Get evm bridge tokens from tokens table of tport.start
export const updateTPortTokens = async function ({ commit, getters }) {
  try {
    let tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: process.env.XCHAIN_ADDRESS,
      scope: process.env.XCHAIN_ADDRESS,
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });
    for (let asset of tableResults.rows) {
      // console.log("Asset: ", asset);
      asset.token = {
        sym: this.$getSymFromAsset(asset.token),
        decimals: this.$getDecimalFromAsset(asset.token),
        contract: asset.token.contract,
      };
      tokens.push(asset);
    }
    // console.log("TPort Tokens:", tokens);
    commit("setTPortTokens", { tokens });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTeleports = async function ({ commit }, account) {
  try {
    let res = await this.$api.getTableRows({
      code: process.env.XCHAIN_ADDRESS,
      scope: process.env.XCHAIN_ADDRESS,
      table: "teleports",
      key_type: "i64",
      index_position: 2,
      lower_bound: account,
      upper_bound: account,
      limit: 10000,
      reverse: false,
      show_payer: false,
    });

    let teleports = [];
    res.rows.forEach((r) => {
      r.processing = r.oracles.length <= 1;
      teleports.push(r);
    });

    teleports = teleports
      .map((t) => {
        if (t.date) {
          t.time = new Date(t.date + "Z").valueOf();
        }
        return t;
      })
      .sort((a, b) => (a.time < b.time ? 1 : -1));

    // console.log("Teleports:", teleports);
    commit("setTeleports", { teleports });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get reclaimable tokens from xchain.start wallets table by scope
export const updateReclaimableTokens = async function ({ commit, getters }, account) {
  try {
    let res = await this.$api.getTableRows({
      code: process.env.XCHAIN_ADDRESS,
      scope: account,
      table: "wallets",
    });
    // console.log(res.rows)

    commit("setReclaimableTokens", { reclaimableTokens: res.rows });
  } catch (error) {
    console.error("updateReclaimableTokens")
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
