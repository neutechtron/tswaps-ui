export const formatPoolList = function ({ commit, rootGetters }, rows) {
  const getCurrentChain =
    rootGetters["blockchains/getCurrentChain"].NETWORK_NAME.toLowerCase();
  const pools = [];

  if (rows) {
    for (const pool of rows) {
      const poolBlacklist = JSON.parse(process.env.POOL_BLACKLIST);
      if (poolBlacklist.includes(pool.id)) {
        continue;
      }
      let res0 = pool.reserve0;
      let res1 = pool.reserve1;

      let temp_pool = {
        ...pool,
        reserve0: {
          quantity: this.$getQuantity(res0),
          symbol: this.$exAssToSymbol(res0),
          precision: this.$exAssToPrecision(res0),
          contract: res0.contract,
        },
        reserve1: {
          quantity: this.$getQuantity(res1),
          symbol: this.$exAssToSymbol(res1),
          precision: this.$exAssToPrecision(res1),
          contract: res1.contract,
        },
        lpSymbol: this.$exAssToSymbol(pool.liquidity),
        lpPrecision: this.$exAssToPrecision(pool.liquidity),
        lpContract: pool.liquidity.contract,
        chain: getCurrentChain,
      };

      // Check duplicates for pools
      if (!pools.find((t) => t.id === pool.id)) {
        pools.push(temp_pool);
      }
    }
  }

  return pools;
};

export const updatePools = async function ({
  commit,
  rootGetters,
  dispatch,
  getters,
}) {
  try {
    let temp_pools = [];

    const tableResults = await this.$api.getTableRows({
      code: process.env.SWAP_CONTRACT,
      scope: process.env.SWAP_CONTRACT,
      table: "pairs",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });

    const formatPoolList = await dispatch("formatPoolList", tableResults.rows);

    // Get pool stats from stats.swaps
    const statsResults = await this.$api.getTableRows({
      code: process.env.STATS_CONTRACT,
      scope: process.env.STATS_CONTRACT,
      table: "tradedata",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });

    // append pool stats to pools
    for (const pool of formatPoolList) {
      if (statsResults.rows.find((t) => t.pair_id === pool.id)) {
        // console.log(statsResults.rows.find(
        //     t => t.pair_id === pool.id
        // ))
        let volume_24h = statsResults.rows.find(
          (t) => t.pair_id === pool.id
        ).volume_24h;

        let price_change_24h = statsResults.rows.find(
          (t) => t.pair_id === pool.id
        ).price_change_24h;

        let fees_24h = statsResults.rows.find(
          (t) => t.pair_id === pool.id
        ).fees_24h;

        let fee_cumulative = statsResults.rows.find(
          (t) => t.pair_id === pool.id
        ).fee_cumulative;

        let liquidity_stats = statsResults.rows.find(
          (t) => t.pair_id === pool.id
        ).liquidity;

        temp_pools.push({
          ...pool,
          volume_24h,
          price_change_24h,
          fees_24h,
          fee_cumulative,
          liquidity_stats,
        });
      } else {
        temp_pools.push(pool);
      }
    }

    // calculate USD liquidity and volume_24h
    await dispatch("tokens/updateUsdValue", {}, { root: true });
    const TlosToken = rootGetters["tokens/getTLOSToken"];

    if (TlosToken) {
      const TlosUsdPrice = TlosToken.UsdPrice;

      for (const [index, pool] of temp_pools.entries()) {
        // skip pool with don't include TLOS
        if (
          (pool.reserve0.contract === TlosToken.contract &&
            pool.reserve0.symbol === TlosToken.symbol) ||
          (pool.reserve1.contract === TlosToken.contract &&
            pool.reserve1.symbol === TlosToken.symbol)
        ) {
          // update token usd price, liquidity and volume_24h
          if (
            pool.reserve0.contract === TlosToken.contract &&
            pool.reserve0.symbol === TlosToken.symbol
          ) {
            pool.reserve0.usdAmount = pool.reserve0.quantity * TlosUsdPrice;
            pool.reserve1.usdAmount =
              pool.reserve1.quantity * TlosUsdPrice * pool.price1_last;
            const otherToken = rootGetters["tokens/getToken"](
              pool.reserve1.contract,
              pool.reserve1.symbol
            );
            commit(
              "tokens/setUsdPrice",
              { token: otherToken, price: pool.price1_last * TlosUsdPrice },
              { root: true }
            );

            // volume_24h
            if (pool.volume_24h !== undefined) {
              let volume_24h_0 =
                pool.volume_24h
                  .find((token) => token.key === TlosToken.symbol)
                  .value.split(" ")[0] * TlosUsdPrice;
              let volume_24h_1 =
                pool.volume_24h
                  .find((token) => token.key === otherToken.symbol)
                  .value.split(" ")[0] *
                pool.price1_last *
                TlosUsdPrice;

              pool.volume_24h.find(
                (token) => token.key === TlosToken.symbol
              ).usdAmount = volume_24h_0;
              pool.volume_24h.find(
                (token) => token.key === otherToken.symbol
              ).usdAmount = volume_24h_1;
            }
          } else {
            pool.reserve1.usdAmount = pool.reserve1.quantity * TlosUsdPrice;
            pool.reserve0.usdAmount =
              pool.reserve0.quantity * TlosUsdPrice * pool.price0_last;
            const otherToken = rootGetters["tokens/getToken"](
              pool.reserve0.contract,
              pool.reserve0.symbol
            );
            commit(
              "tokens/setUsdPrice",
              { token: otherToken, price: pool.price0_last * TlosUsdPrice },
              { root: true }
            );

            // volume_24h
            if (pool.volume_24h !== undefined) {
              let volume_24h_0 =
                pool.volume_24h
                  .find((token) => token.key === TlosToken.symbol)
                  .value.split(" ")[0] * TlosUsdPrice;
              let volume_24h_1 =
                pool.volume_24h
                  .find((token) => token.key === otherToken.symbol)
                  .value.split(" ")[0] *
                pool.price0_last *
                TlosUsdPrice;

              pool.volume_24h.find(
                (token) => token.key === TlosToken.symbol
              ).usdAmount = volume_24h_0;
              pool.volume_24h.find(
                (token) => token.key === otherToken.symbol
              ).usdAmount = volume_24h_1;
            }
          }

          // Calculate APR from fees and rex
          if (pool.fees_24h !== undefined) {
            //APR = (24hr_fee_token_a / liquidity_token_a + 24hr_fee_token_b/ liquidity_token_b) / 2 x 365
            let feeShare0 =
              pool.fees_24h[0].value.split(" ")[0] /
              pool.liquidity_stats[0].value.split(" ")[0];
            let feeShare1 =
              pool.fees_24h[1].value.split(" ")[0] /
              pool.liquidity_stats[1].value.split(" ")[0];
            let feeAPR = ((feeShare0 + feeShare1) / 2) * 365;

            pool.APR = { LP: feeAPR, total: feeAPR };
          }

          temp_pools[index] = pool;
        }
      }

      // TODO breaks with non TLOS tokens, needs some basis
      // Non TLOS pools
      for (const [index, pool] of temp_pools.entries()) {
        // skip pool with don't include have usd value
        let token0 = rootGetters["tokens/getToken"](
          pool.reserve0.contract,
          pool.reserve0.symbol
        );
        let token1 = rootGetters["tokens/getToken"](
          pool.reserve1.contract,
          pool.reserve1.symbol
        );

        // update token usd price, liquidity and volume_24h
        if (token0?.UsdPrice !== undefined) {
          pool.reserve0.usdAmount = pool.reserve0.quantity * token0?.UsdPrice;
          pool.reserve1.usdAmount =
            pool.reserve1.quantity * token0?.UsdPrice * pool.price1_last;
          if (token1?.UsdPrice === undefined) {
            commit(
              "tokens/setUsdPrice",
              { token: token1, price: pool.price1_last * token0?.UsdPrice },
              { root: true }
            );
          }
          // volume_24h
          if (pool.volume_24h !== undefined) {
            let volume_24h_0 =
              pool.volume_24h
                .find((token) => token.key === token0.symbol)
                .value.split(" ")[0] * token0?.UsdPrice;
            let volume_24h_1 =
              pool.volume_24h
                .find((token) => token.key === token1.symbol)
                .value.split(" ")[0] *
              pool.price1_last *
              token0?.UsdPrice;

            pool.volume_24h.find(
              (token) => token.key === token0.symbol
            ).usdAmount = volume_24h_0;
            pool.volume_24h.find(
              (token) => token.key === token1.symbol
            ).usdAmount = volume_24h_1;
          }
        } else if (token1?.UsdPrice !== undefined) {
          pool.reserve1.usdAmount = pool.reserve1.quantity * token1?.UsdPrice;
          pool.reserve0.usdAmount =
            pool.reserve0.quantity * token1?.UsdPrice * pool.price0_last;
          if (token0?.UsdPrice === undefined) {
            commit(
              "tokens/setUsdPrice",
              { token: token0, price: pool.price0_last * token1?.UsdPrice },
              { root: true }
            );
          }
          // volume_24h
          if (pool.volume_24h !== undefined) {
            let volume_24h_0 =
              pool.volume_24h
                .find((token) => token.key === token1.symbol)
                .value.split(" ")[0] * token1?.UsdPrice;
            let volume_24h_1 =
              pool.volume_24h
                .find((token) => token.key === token0.symbol)
                .value.split(" ")[0] *
              pool.price0_last *
              token1?.UsdPrice;

            pool.volume_24h.find(
              (token) => token.key === token1.symbol
            ).usdAmount = volume_24h_0;
            pool.volume_24h.find(
              (token) => token.key === token0.symbol
            ).usdAmount = volume_24h_1;
          }
        }

        // Calculate APR from fees and rex
        if (pool.fees_24h !== undefined) {
          //APR = (24hr_fee_token_a / liquidity_token_a + 24hr_fee_token_b/ liquidity_token_b) / 2 x 365
          let feeShare0 =
            pool.fees_24h[0].value.split(" ")[0] /
            pool.liquidity_stats[0].value.split(" ")[0];
          let feeShare1 =
            pool.fees_24h[1].value.split(" ")[0] /
            pool.liquidity_stats[1].value.split(" ")[0];
          let feeAPR = ((feeShare0 + feeShare1) / 2) * 365;

          pool.APR = { LP: feeAPR, total: feeAPR };
        }

        temp_pools[index] = pool;
      }
    }

    let pools = temp_pools;

    commit("setPools", pools);
  } catch (error) {
    console.error(error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateUserLiquidityPools = async function (
  { commit, rootGetters, getters },
  accountName
) {
  try {
    if (accountName !== null) {
      // console.log("Account: " + accountName);
      let lpTokens = [];

      // TODO calculate impermanent loss
      const lpPositions = await this.$api.getTableRows({
        code: process.env.LPTOKEN_CONTRACT,
        scope: accountName,
        table: "accounts",
        limit: 10000,
        reverse: false,
        show_payer: false,
      });
      lpTokens.push(...lpPositions.rows);

      const allpools = getters.getPools;
      const userPools = [];
      // console.log(lpTokens)

      for (const token of lpTokens) {
        let balance_asset = token.balance;
        let temp_pool = allpools.find(
          (p) => p.lpSymbol == this.$assetToSymbol(balance_asset)
        );

        if (temp_pool) {
          let currentCost0 = 0;
          let currentCost1 = 0;
          let lpBalance = this.$assetToAmount(
            balance_asset,
            this.$assetToPrecision(balance_asset)
          );

          // Calculate current cost = LP * (Reserve0 / Reserve_total)
          if (temp_pool.liquidity && lpBalance > 0) {
            // console.log(temp_pool)
            if (temp_pool.protocol === "uniswap") {
              currentCost0 =
                lpBalance *
                (temp_pool.reserve0.quantity /
                  Math.sqrt(
                    temp_pool.reserve0.quantity * temp_pool.reserve1.quantity
                  ));
              currentCost0 = this.$toAsset(
                currentCost0,
                temp_pool.reserve0.precision,
                temp_pool.reserve0.symbol
              );
              // console.log("currentCost0: " + currentCost0)
              currentCost1 =
                lpBalance *
                (temp_pool.reserve1.quantity /
                  Math.sqrt(
                    temp_pool.reserve0.quantity * temp_pool.reserve1.quantity
                  ));
              currentCost1 = this.$toAsset(
                currentCost1,
                temp_pool.reserve1.precision,
                temp_pool.reserve1.symbol
              );
              // console.log("currentCost1: " + currentCost1)
            } else if (temp_pool.protocol === "curve") {
              currentCost0 =
                lpBalance *
                (temp_pool.reserve0.quantity /
                  (temp_pool.reserve0.quantity + temp_pool.reserve1.quantity));
              currentCost0 = this.$toAsset(
                currentCost0,
                temp_pool.reserve0.precision,
                temp_pool.reserve0.symbol
              );
              // console.log("currentCost0: " + currentCost0)
              currentCost1 =
                lpBalance *
                (temp_pool.reserve1.quantity /
                  (temp_pool.reserve0.quantity + temp_pool.reserve1.quantity));
              currentCost1 = this.$toAsset(
                currentCost1,
                temp_pool.reserve1.precision,
                temp_pool.reserve1.symbol
              );
              // console.log("currentCost1: " + currentCost1)
            }
            userPools.push({
              ...temp_pool,
              lpBalance: lpBalance,
              lpOldCost0: token.cost0,
              lpOldCost1: token.cost1,
              lpCurrentCost0: currentCost0,
              lpCurrentCost1: currentCost1,
            });
          }
        }
      }
      commit("setUserLiquidityPools", userPools);
    }
  } catch (error) {
    console.error("updateUserLiquidityPools", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateConfig = async function ({ commit, rootGetters }) {
  try {
    const config = await this.$api.getTableRows({
      code: process.env.SWAP_CONTRACT,
      scope: process.env.SWAP_CONTRACT,
      table: "config",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });

    commit("setConfig", config.rows[0]);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
