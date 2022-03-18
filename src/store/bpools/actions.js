import axios from "axios";
import { Api, JsonRpc } from "eosjs";

// possible rpcs
export const possibleRPCs = async function({
  commit,
  dispatch,
  rootGetters,
  getters
}) {
  let blockchains = rootGetters["blockchains/allBlockchains"];
  let possibleChains = blockchains.filter(
    a => String(a.TEST_NETWORK) === process.env.TESTNET
  );

  let apis = [];

  for (const chain of possibleChains) {
    let rpc = new JsonRpc(
      `${chain.NETWORK_PROTOCOL}://${chain.NETWORK_HOST}:${chain.NETWORK_PORT}`
    );
    apis.push(rpc);
  }

  // console.log(apis)
  return { apis: apis, chains: possibleChains };
};

// Get pool info from chain by id, put into store
export const getChainPoolByID = async function({ commit, dispatch }, id) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      lower_bound: id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    // console.log(this.$api.currentChain);

    let poolTable = tableResults.rows[tableResults.rows.length - 1];
    // console.log(poolTable);

    //check dates are unix
    poolTable.pool_open = new Date(poolTable.pool_open + "Z").valueOf();
    poolTable.private_end = new Date(poolTable.private_end + "Z").valueOf();
    poolTable.public_end = new Date(poolTable.public_end + "Z").valueOf();

    // set chain in pool
    poolTable.chain = this.$api.currentChain.NETWORK_NAME;

    commit("updatePoolOnState", { poolTable });
    await dispatch("updatePoolSettings", { id, chain: poolTable.chain });
  } catch (error) {
    console.log("getChainPoolByID");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get pool info from chain by id, put into store
export const getChainPoolByIDChain = async function(
  { commit, dispatch },
  payload
) {
  try {
    let rpcs = await dispatch("possibleRPCs", { root: true });
    let api =
      rpcs.apis[rpcs.chains.findIndex(el => el.NETWORK_NAME === payload.chain)];

    const tableResults = await api.get_table_rows({
      json: true,
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      lower_bound: payload.id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    // console.log(this.$api.currentChain);

    let poolTable = tableResults.rows[tableResults.rows.length - 1];
    // console.log(poolTable);

    //check dates are unix
    poolTable.pool_open = new Date(poolTable.pool_open + "Z").valueOf();
    poolTable.private_end = new Date(poolTable.private_end + "Z").valueOf();
    poolTable.public_end = new Date(poolTable.public_end + "Z").valueOf();

    // set chain in pool
    poolTable.chain =
      rpcs.chains[
        rpcs.chains.findIndex(el => el.NETWORK_NAME === payload.chain)
      ].NETWORK_NAME;

    commit("updatePoolOnState", { poolTable });
    await dispatch("updatePoolSettings", {
      id: poolTable.id,
      chain: poolTable.chain
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get all pools from chain, populate store
export const getAllChainPools = async function({ commit, dispatch }) {
  try {
    let rpcs = await dispatch("possibleRPCs", { root: true });
    // console.log(rpcs)

    for (const [index, api] of rpcs.apis.entries()) {
      const tableResults = await api.get_table_rows({
        json: true,
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: process.env.CONTRACT_TABLE, // Table name
        limit: 10000, // Maximum number of rows that we want to get
        reverse: true, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // console.log(tableResults.rows)
      // sort according to nearest pool open
      tableResults.rows.sort(function(a, b) {
        return new Date(b.pool_open) - new Date(a.pool_open);
      });

      for (const pool of tableResults.rows) {
        let id = pool.id;

        //check dates are unix
        pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
        pool.private_end = new Date(pool.private_end + "Z").valueOf();
        pool.public_end = new Date(pool.public_end + "Z").valueOf();

        const poolTable = pool;

        // set chain in pool
        poolTable.chain = rpcs.chains[index].NETWORK_NAME;

        commit("updatePoolOnState", { poolTable });
        await dispatch("updatePoolSettings", { id, chain: poolTable.chain });
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Test function for reading address
export const getChainAccountInfo = async function({ commit }, accountName) {
  const rpc = this.$api.getRpc();
  console.log(await rpc.get_account(accountName));
  // console.log(await rpc.history_get_actions(accountName));

  // console.log(await rpc.get_currency_balance(address, "fuzzytestnet"));
};

// if pool is funded with the token
export const ifPoolFunded = async function(
  { commit, rootGetters, getters },
  payload
) {
  try {
    if (payload.account !== null) {
      // get wallet table info
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: payload.account, // Account that owns the data
        table: "wallets", // Table name
        limit: 10000,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // get pool info
      const pool = getters.getPoolByIDChain(payload.id, payload.chain);
      // console.log(pool);

      // console.log(tableResults.rows);
      let amount_inwallet = this.$chainToQty(
        tableResults.rows.find(el => el.contract === pool.swap_ratio.contract)
          .balance
      );
      // console.log(amount_inwallet);

      let amount_required = parseFloat(
        (
          this.$chainToQty(pool.swap_ratio.quantity) *
          this.$chainToQty(pool.hard_cap)
        ).toPrecision(15)
      );
      // console.log(amount_required);

      // if ammount of tokens in wallets tabel enough
      if (amount_inwallet >= amount_required) {
        // console.log("Pool is funded");
        return true;
      } else {
        // console.log("Pool not funded");
        return false;
      }
    }
  } catch (error) {
    console.error("ifPoolFunded");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// calculate needed remaining funding
export const neededFunds = async function(
  { commit, rootGetters, getters },
  payload
) {
  try {
    if (payload.account !== null) {
      // get wallet table info
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: payload.account, // Account that owns the data
        table: "wallets", // Table name
        limit: 10000,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });
      console.log(tableResults.rows);

      // get pool info
      const pool = getters.getPoolByID(payload.id);
      // console.log(pool);
      let amount_inwallet = 0;
      let needed_sym = this.$chainToSym(pool.swap_ratio.quantity);
      let token_contract_entries = tableResults.rows.filter(
        a => a.contract === pool.swap_ratio.contract
      );
      // console.log(token_contract_entries)

      if (token_contract_entries.length > 0) {
        if (
          token_contract_entries.filter(
            a => this.$chainToSym(a.balance) === needed_sym
          )
        ) {
          amount_inwallet = this.$chainToQty(
            tableResults.rows.find(
              el => el.contract === pool.swap_ratio.contract
            ).balance
          );
        }
      }
      // console.log(amount_inwallet);

      let amount_required = parseFloat(
        (
          this.$chainToQty(pool.swap_ratio.quantity) *
          this.$chainToQty(pool.hard_cap)
        ).toPrecision(15)
      );
      // console.log(amount_required);

      // return needed amount
      // console.log(amount_required-amount_inwallet)
      return amount_required - amount_inwallet;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Deprecated - Get received pool tokens
export const getReceivedPoolTokenTxns = async function({ getters }, account) {
  let currentChain = getters["blockchains/currentChain"];
  let response = await axios(
    `${currentChain.NETWORK_PROTOCOL}://${currentChain.NETWORK_HOST}` +
      `/v2/history/get_actions?account=${account}` +
      `&limit=1000&sort=desc&transfer.to=${account}` +
      `&transfer.memo=allocation%20of%20pool%20tokens`
  );
  // console.log(response.data.actions)
  return response.data.actions;
};

// Get tokens from pooltokens table
export const setPoolTokens = async function({ commit, dispatch }) {
  try {
    const res = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS,
      scope: process.env.CONTRACT_ADDRESS,
      table: "pooltokens",
      limit: 10000,
      reverse: false,
      show_payer: false
    });

    // console.log("setPooltokens table rows:", res.rows);
    commit("updatePoolTokens", { poolTokens: res.rows });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get balance from chain for given address and token
export const getBalanceFromChain = async function({ commit }, payload) {
  try {
    const rpc = this.$api.getRpc();
    // console.log(
    //   await rpc.get_currency_balance(
    //     payload.address,
    //     payload.accountName,
    //     payload.sym
    //   )
    // );
    if (payload.accountName !== null) {
      let balance = (
        await rpc.get_currency_balance(
          payload.address,
          payload.accountName,
          payload.sym
        )
      )[0];
      // console.log("balance:")
      // console.log(balance)
      if (balance !== undefined) {
        return balance;
      } else {
        return `0 ${payload.sym}`;
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
    return `0 ${payload.sym}`;
  }
};

// gets the precision of Token
export const getTokenPrecision = async function(
  { commit, getters },
  token_info
) {
  try {
    const rpc = this.$api.getRpc();

    const tableResults = await this.$api.getTableRows({
      code: token_info.address, // Contract that we target
      scope: token_info.token_symbol, // Account that owns the data
      table: "stat", // Table name
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    console.log(tableResults.rows[tableResults.rows.length - 1]);
    let supply = tableResults.rows[tableResults.rows.length - 1];
    // console.log(supply.max_supply);
    let commaidx = supply.max_supply.indexOf(".") + 1;
    let spaceidx = supply.max_supply.indexOf(" ");
    const precision = supply.max_supply.slice(commaidx, spaceidx).length;
    // console.log(precision);
    return precision;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updatePoolSettings = async function(
  { commit, getters, dispatch },
  payload
) {
  const pool = getters.getPoolByIDChain(payload.id, payload.chain);
  // console.log(pool)

  // Update status
  var poolStatus = "loading";
  const currentDate = Date.now();
  if (pool.status === "draft") {
    poolStatus = "draft";
  } else if (currentDate < pool.pool_open) {
    poolStatus = "upcoming";
  } else if (
    currentDate > pool.public_end ||
    this.$chainToQty(pool.remaining_offer) <= 0
  ) {
    poolStatus = "completed";
    if (pool.status === "success") poolStatus = "filled";
    else if (pool.status === "cancelled") poolStatus = "cancelled";
  } else {
    poolStatus = "open";
  }

  // Update access type
  var access_type = "Public";
  if (pool.private_end >= pool.public_end) {
    access_type = "Premium";
  } else if (pool.private_end <= pool.pool_open) {
    access_type = "Public";
  } else if (currentDate > pool.private_end) {
    access_type = "Public";
  } else if (currentDate < pool.private_end) {
    access_type = "Premium";
  }

  // Update progress
  const total_raise = this.$chainToQty(pool.total_raise);
  const hard_cap = this.$chainToQty(pool.hard_cap);
  var progress = 0;
  if (hard_cap !== 0) progress = total_raise / hard_cap;

  // Update chain on state
  commit({
    type: "setPoolSettings",
    id: payload.id,
    pool_status: poolStatus,
    access_type: access_type,
    progress: progress,
    chain: pool.chain
  });

  // TODO Is this needed?
  // await dispatch("updateSentimentByPoolID", payload.id);
  // await dispatch("updateCommentsByPoolID", payload.id);
};

// Get pools created from chain
export const getCreatedChainPools = async function(
  { commit, dispatch },
  owner
) {
  try {
    if (owner !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: process.env.CONTRACT_TABLE, // Table name
        limit: 1000,
        index_position: 2,
        key_type: "i64",
        lower_bound: owner,
        upper_bound: owner,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });
      // console.log("Created pools:");
      for (const pool of tableResults.rows) {
        // console.log(pool);
        let id = pool.id;

        //check dates are unix
        pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
        pool.private_end = new Date(pool.private_end + "Z").valueOf();
        pool.public_end = new Date(pool.public_end + "Z").valueOf();

        // set chain in pool
        let poolTable = pool;
        poolTable.chain = this.$api.currentChain.NETWORK_NAME;

        commit("updatePoolOnState", { poolTable });
        await dispatch("updatePoolSettings", { id, chain: poolTable.chain });
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getJoinedChainPools = async function(
  { commit, getters, dispatch },
  user
) {
  try {
    if (user !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "poolaccounts", // Table name
        limit: 1000,
        index_position: 3,
        key_type: "i64",
        lower_bound: user,
        upper_bound: user,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // console.log("Joined pools:");
      // console.log(tableResults.rows);
      // console.log(this.$api.currentChain.NETWORK_NAME);
      // sort according to nearest pool open
      tableResults.rows.sort(function(a, b) {
        return new Date(a.pool_open) - new Date(b.pool_open);
      });

      let id_chain_list = [];
      let pool_id_list = [];
      pool_id_list = tableResults.rows.map(a => a.pool_id);
      pool_id_list = [...new Set(pool_id_list)]; // remove duplicates
      // console.log(pool_id_list);

      if (pool_id_list.length > 0) {
        for (const pool_id of pool_id_list) {
          await dispatch("getChainPoolByIDChain", {
            id: pool_id,
            chain: this.$api.currentChain.NETWORK_NAME
          });
          id_chain_list.push({
            id: pool_id,
            chain: this.$api.currentChain.NETWORK_NAME
          });
        }
      }

      return id_chain_list;
    } else {
      return [];
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// for each blockchain get the featured pool ids
export const getFeaturedChainPools = async function({
  commit,
  getters,
  dispatch
}) {
  try {
    let rpcs = await dispatch("possibleRPCs", { root: true });
    let id_chain_list = [];

    for (const [index, api] of rpcs.apis.entries()) {
      const tableResults = await api.get_table_rows({
        json: true,
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "settings", // Table name
        limit: 1000,
        index_position: 1,
        key_type: "i64",
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });
      // console.log("Featured pools:");
      // console.log(rpcs.chains[index].NETWORK_NAME);

      let pool_id_list = [];
      pool_id_list = tableResults.rows[0].featured_pools;
      pool_id_list = [...new Set(pool_id_list)]; // remove duplicates
      // console.log(pool_id_list);

      if (pool_id_list.length > 0) {
        for (const pool_id of pool_id_list) {
          await dispatch("getChainPoolByIDChain", {
            id: pool_id,
            chain: rpcs.chains[index].NETWORK_NAME
          });
          id_chain_list.push({
            id: pool_id,
            chain: rpcs.chains[index].NETWORK_NAME
          });
        }
      }
    }
    // console.log(id_chain_list);
    return id_chain_list;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get upcoming pools from chain, populate store
export const getUpcomingChainPools = async function({ commit, dispatch }) {
  try {
    let rpcs = await dispatch("possibleRPCs", { root: true });
    let pool_list = [];

    for (const [index, api] of rpcs.apis.entries()) {
      const tableResults = await api.get_table_rows({
        json: true,
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: process.env.CONTRACT_TABLE, // Table name
        limit: 1000, // Maximum number of rows that we want to get
        index_position: 3,
        key_type: "i64",
        // lower_bound: 1, // show all published pools
        lower_bound: Math.trunc(Date.now() / 1000), // get upcoming pools
        // upper_bound: Math.trunc(Date.now()/1000), // to get closed and open pools
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // console.log("Upcoming pools");

      // sort according to nearest pool open
      tableResults.rows.sort(function(a, b) {
        return new Date(a.pool_open) - new Date(b.pool_open);
      });

      // console.log(tableResults);
      let pool_id_list = [];
      pool_id_list = tableResults.rows.map(a => a.id);
      pool_id_list = [...new Set(pool_id_list)]; // remove duplicates

      // console.log(rpcs.chains[index].NETWORK_NAME);
      // console.log(pool_id_list);

      if (pool_id_list.length > 0) {
        for (const pool_id of pool_id_list) {
          await dispatch("getChainPoolByIDChain", {
            id: pool_id,
            chain: rpcs.chains[index].NETWORK_NAME
          });
          pool_list.push({
            id: pool_id,
            chain: rpcs.chains[index].NETWORK_NAME
          });
        }
      }
    }
    return pool_list;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get personal allocation for pool
export const getAllocationByPool = async function(
  { commit, getters, dispatch },
  payload
) {
  try {
    if (payload.account !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "poolaccounts", // Table name
        limit: 10000,
        index_position: 3,
        key_type: "i64",
        lower_bound: payload.account,
        upper_bound: payload.account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      const allocationTable = tableResults.rows.filter(
        a => a.account === payload.account && a.pool_id === payload.poolID
      )[0];
      // console.log("Allocation:");
      if (allocationTable !== undefined) {
        // console.log(allocationTable);
        return allocationTable;
      } else {
        return {};
      }
    } else {
      return {};
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get premuim stake value
export const getPremiumStake = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const premium_access_fee = tableResults.rows[0].premium_access_fee;
    // console.log("Premium stake amount");
    // console.log(premium_access_fee);
    return premium_access_fee;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

//get platform token (START)
export const getPlatformToken = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const platform_token = tableResults.rows[0].platform_token;
    // console.log("Premium stake amount");
    // console.log(premium_access_fee);
    return platform_token;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get settings table
export const getPoolsSettings = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    return tableResults.rows[0];
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get settings table of a specific chain
export const getPoolsSettingsAllChains = async function({ commit, dispatch }) {
  try {
    let rpcs = await dispatch("possibleRPCs", { root: true });
    let result = {};
    for (let i = 0; i < rpcs.apis.length; i++) {
      let api = rpcs.apis[i];
      let chain = rpcs.chains[i];
      let timeout;
      const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          resolve({rows: [{}]});
        }, 2000);
      });
      const response = await Promise.race([
        (api.get_table_rows({
          json: true,
          code: process.env.CONTRACT_ADDRESS, // Contract that we target
          scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
          table: "settings", // Table name
          limit: 1000,
          index_position: 1,
          key_type: "i64",
          reverse: false, // Optional: Get reversed data
          show_payer: false // Optional: Show ram payer
        })),
        timeoutPromise
      ]);
      if (timeout) {
        //the code works without this but let's be safe and clean up the timeout
        clearTimeout(timeout);
      }

      // console.log(api, chain, tableResults.rows[0]);
      result[chain.NETWORK_NAME] = response.rows[0];
    }
    // console.log(result);
    return result;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// check if tokens already staked
export const checkStakedChain = async function(
  { commit, getters, dispatch },
  payload
) {
  try {
    if (payload.account !== null) {
      const stakeBalanceTbl = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "stakebalance", // Table name
        limit: 10000,
        index_position: 1,
        key_type: "i64",
        lower_bound: payload.account,
        upper_bound: payload.account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      let allocationTable = await dispatch("getAllocationByPool", {
        account: payload.account,
        poolID: payload.poolID
      });

      // get premium stake
      const premium_access_fee = await dispatch("getPremiumStake");
      let premium_access_fee_qty = this.$chainToQty(premium_access_fee);
      // console.log(premium_access_fee_qty)

      const staked_START = this.$chainToQty(stakeBalanceTbl.rows[0].staked);
      const liquid_START = this.$chainToQty(stakeBalanceTbl.rows[0].liquid);
      // console.log("START staked?");
      // console.log(staked_amount);

      if (
        Object.keys(allocationTable).length === 0 &&
        allocationTable.constructor === Object
      ) {
        return false;
      } else if (
        (Object.keys(allocationTable).length > 0 &&
          allocationTable.constructor === Object) ||
        liquid_START >= premium_access_fee_qty // if already made 1st purchase or if have liquid
      ) {
        return true;
      } else {
        console.log("Nothing");
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get possible base tokens
export const getBaseTokens = async function(
  { commit, getters, dispatch },
  return_avatar = false
) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "tokens", // Table name
      limit: 10000,
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    if (return_avatar) {
      let base_token_info_list = tableResults.rows.filter(a => a.enabled === 1);

      return base_token_info_list;
    } else {
      let base_token_info_list = tableResults.rows
        .filter(a => a.enabled === 1)
        .map(a => a.token_info);

      return base_token_info_list;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateSentimentByPoolID = async function({ commit }, poolID) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS,
      scope: poolID,
      table: "sentiment",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    const sentiment_table = tableResults.rows;
    commit("setPoolSentimentTable", {
      id: poolID,
      sentiment_table,
      chain: this.$api.currentChain.NETWORK_NAME
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateCommentsByPoolID = async function({ commit }, poolID) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS,
      scope: poolID,
      table: "comments",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    const comments_table = tableResults.rows.map(el => {
      el.timestamp = new Date(el.timestamp + "Z").valueOf();
      return el;
    });
    comments_table.sort((a, b) => {
      if (a.timestamp > b.timestamp) return -1;
      if (a.timestamp < b.timestamp) return 1;
      return 0;
    });
    commit("setPoolCommentsTable", {
      id: poolID,
      comments_table,
      chain: this.$api.currentChain.NETWORK_NAME
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
