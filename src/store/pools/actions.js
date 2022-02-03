export const formatPoolList = function ({ commit, rootGetters }, rows) {
    const getCurrentChain = rootGetters[
        "blockchains/getCurrentChain"
    ].NETWORK_NAME.toLowerCase();
    const pools = [];

    if (rows) {
        for (const pool of rows) {
            let res0 = pool.reserve0;
            let res1 = pool.reserve1;

            let temp_pool = {
                ...pool,
                reserve0: {
                    quantity: this.$getQuantity(res0),
                    symbol: this.$exAssToSymbol(res0),
                    precision: this.$exAssToPrecision(res0),
                    contract: res0.contract
                },
                reserve1: {
                    quantity: this.$getQuantity(res1),
                    symbol: this.$exAssToSymbol(res1),
                    precision: this.$exAssToPrecision(res1),
                    contract: res1.contract
                },
                contract0: res0.contract,
                contract1: res1.contract,
                lpSymbol: this.$exAssToSymbol(pool.liquidity),
                lpPrecision: this.$exAssToPrecision(pool.liquidity),
                lpContract: pool.liquidity.contract,
                chain: getCurrentChain
            };

            // Check duplicates for pools
            if (!pools.find(t => t.id === pool.id)) {
                pools.push(temp_pool);
            }
        }
    }

    return pools;
};

export const updatePools = async function ({ commit, rootGetters, dispatch, getters }) {
    try {
        let temp_pools = [];

        const tableResults = await this.$api.getTableRows({
            code: process.env.SWAP_CONTRACT,
            scope: process.env.SWAP_CONTRACT,
            table: "pairs",
            limit: 10000,
            reverse: false,
            show_payer: false
        });

        const formatPoolList = await dispatch("formatPoolList", tableResults.rows);
        // console.log(formatPoolList);


        // Get pool stats from stats.swaps
        const statsResults = await this.$api.getTableRows({
            code: process.env.STATS_CONTRACT,
            scope: process.env.STATS_CONTRACT,
            table: "tradedata",
            limit: 10000,
            reverse: false,
            show_payer: false
        });

        // console.log(statsResults.rows);

        // append pool stats to pools
        for (const pool of formatPoolList) {
            if (statsResults.rows.find(
                t => t.pair_id === pool.id
            )) {
                let volume_24h = statsResults.rows.find(
                    t => t.pair_id === pool.id
                ).volume_24h;

                let price_change_24h = statsResults.rows.find(
                    t => t.pair_id === pool.id
                ).price_change_24h;

                temp_pools.push({
                    ...pool,
                    volume_24h,
                    price_change_24h
                });

            } else {
                temp_pools.push(pool);
            }
        }

        // console.log(temp_pools);

        // calculate USD liquidity and volume_24h
        await dispatch("tokens/updateUsdValue", {}, { root: true });
        const TlosToken = (rootGetters[
            "tokens/getTLOSToken"
        ]);
        const TlosUsdPrice = TlosToken.UsdPrice
        // console.log("TlosUsdPrice", TlosUsdPrice);

        for (const [index, pool] of temp_pools.entries()) {
            // skip pool with don't include TLOS
            if ((pool.reserve0.contract === TlosToken.contract && pool.reserve0.symbol === TlosToken.symbol)
                || (pool.reserve1.contract === TlosToken.contract && pool.reserve1.symbol === TlosToken.symbol)) {

                // update token usd price, liquidity and volume_24h
                if (pool.reserve0.contract === TlosToken.contract && pool.reserve0.symbol === TlosToken.symbol) {
                    pool.reserve0.usdAmount = pool.reserve0.quantity * TlosUsdPrice;
                    pool.reserve1.usdAmount = pool.reserve1.quantity * TlosUsdPrice * pool.price1_last;
                    const otherToken = (rootGetters[
                        "tokens/getToken"
                    ](pool.reserve1.contract, pool.reserve1.symbol));
                    commit("tokens/setUsdPrice", { token: otherToken, price: pool.price1_last * TlosUsdPrice }, { root: true });

                    // volume_24h
                    if (pool.volume_24h !== undefined) {
                        let volume_24h_0 = pool.volume_24h.find(token => token.key === TlosToken.symbol).value.split(" ")[0] * TlosUsdPrice;
                        let volume_24h_1 = pool.volume_24h.find(token => token.key === otherToken.symbol).value.split(" ")[0] * pool.price1_last * TlosUsdPrice;

                        pool.volume_24h.find(token => token.key === TlosToken.symbol).usdAmount = volume_24h_0;
                        pool.volume_24h.find(token => token.key === otherToken.symbol).usdAmount = volume_24h_1;
                    }

                } else {
                    pool.reserve1.usdAmount = pool.reserve1.quantity * TlosUsdPrice;
                    pool.reserve0.usdAmount = pool.reserve0.quantity * TlosUsdPrice * pool.price0_last;
                    const otherToken = (rootGetters[
                        "tokens/getToken"
                    ](pool.reserve0.contract, pool.reserve0.symbol));
                    commit("tokens/setUsdPrice", { token: otherToken, price: pool.price0_last * TlosUsdPrice }, { root: true });

                    // volume_24h
                    if (pool.volume_24h !== undefined) {
                        let volume_24h_0 = pool.volume_24h.find(token => token.key === TlosToken.symbol).value.split(" ")[0] * TlosUsdPrice;
                        let volume_24h_1 = pool.volume_24h.find(token => token.key === otherToken.symbol).value.split(" ")[0] * pool.price0_last * TlosUsdPrice;

                        pool.volume_24h.find(token => token.key === TlosToken.symbol).usdAmount = volume_24h_0;
                        pool.volume_24h.find(token => token.key === otherToken.symbol).usdAmount = volume_24h_1;
                    }
                }

                // calculate APR
                // https://docs.pancakeswap.finance/products/yield-farming#calculating-lp-reward-apr
                if (pool.volume_24h !== undefined) {
                    let fee = pool.trade_fee / 10000
                    // 24h volume * fee
                    let feeShare = (pool.volume_24h[0].usdAmount + pool.volume_24h[1].usdAmount) * fee;
                    // yearly fees = feeShare * 365
                    let yearlyFees = feeShare * 365;
                    // APR = yearlyFees / (liquidity)
                    let LP_APR = yearlyFees / (pool.reserve0.usdAmount + pool.reserve1.usdAmount)
                    pool.APR = { LP: LP_APR, total: LP_APR }
                }

                temp_pools[index] = pool;
            }
        }

        // Non TLOS pools
        for (const [index, pool] of temp_pools.entries()) {
            // skip pool with don't include have usd value
            let token0 = (rootGetters[
                "tokens/getToken"
            ](pool.reserve0.contract, pool.reserve0.symbol));
            let token1 = (rootGetters[
                "tokens/getToken"
            ](pool.reserve1.contract, pool.reserve1.symbol));

            // update token usd price, liquidity and volume_24h
            if (token0?.UsdPrice !== undefined) {
                pool.reserve0.usdAmount = pool.reserve0.quantity * token0?.UsdPrice;
                pool.reserve1.usdAmount = pool.reserve1.quantity * token0?.UsdPrice * pool.price1_last;

                if (token1?.UsdPrice === undefined) {
                    commit("tokens/setUsdPrice", { token: token1, price: pool.price1_last * token0?.UsdPrice }, { root: true });
                }
                // volume_24h
                if (pool.volume_24h !== undefined) {
                    let volume_24h_0 = pool.volume_24h.find(token => token.key === token0.symbol).value.split(" ")[0] * token0?.UsdPrice;
                    let volume_24h_1 = pool.volume_24h.find(token => token.key === token1.symbol).value.split(" ")[0] * pool.price1_last * token0?.UsdPrice;

                    pool.volume_24h.find(token => token.key === token0.symbol).usdAmount = volume_24h_0;
                    pool.volume_24h.find(token => token.key === token1.symbol).usdAmount = volume_24h_1;
                }

            } else if (token1?.UsdPrice !== undefined) {
                pool.reserve1.usdAmount = pool.reserve1.quantity * token1?.UsdPrice;
                pool.reserve0.usdAmount = pool.reserve0.quantity * token1?.UsdPrice * pool.price0_last;
                if (token0?.UsdPrice === undefined) {
                    commit("tokens/setUsdPrice", { token: token0, price: pool.price0_last * token1?.UsdPrice }, { root: true });
                }
                // volume_24h
                if (pool.volume_24h !== undefined) {
                    let volume_24h_0 = pool.volume_24h.find(token => token.key === token1.symbol).value.split(" ")[0] * token1?.UsdPrice;
                    let volume_24h_1 = pool.volume_24h.find(token => token.key === token0.symbol).value.split(" ")[0] * pool.price0_last * token1?.UsdPrice;

                    pool.volume_24h.find(token => token.key === token1.symbol).usdAmount = volume_24h_0;
                    pool.volume_24h.find(token => token.key === token0.symbol).usdAmount = volume_24h_1;
                }
            }

            // calculate APR
            // https://docs.pancakeswap.finance/products/yield-farming#calculating-lp-reward-apr
            if (pool.volume_24h !== undefined) {
                let fee = pool.trade_fee / 10000
                // 24h volume * fee
                let feeShare = (pool.volume_24h[0].usdAmount + pool.volume_24h[1].usdAmount) * fee;
                // yearly fees = feeShare * 365
                let yearlyFees = feeShare * 365;
                // APR = yearlyFees / (liquidity)
                let LP_APR = yearlyFees / (pool.reserve0.usdAmount + pool.reserve1.usdAmount)
                pool.APR = { LP: LP_APR, total: LP_APR }
            }

            temp_pools[index] = pool;

        }

        let pools = temp_pools;

        commit("setPools", pools);
    } catch (error) {
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
            const res = await this.$api.getTableRows({
                code: process.env.LPTOKEN_CONTRACT,
                scope: accountName,
                table: "accounts",
                limit: 10000,
                reverse: false,
                show_payer: false
            });
            lpTokens.push(...res.rows);

            const allpools = getters.getPools;
            const userPools = [];
            // console.log(allpools)
            // console.log(lpTokens)

            for (const token of lpTokens) {
                // console.log(token)
                let val = this.$exBalanceSymbol(token)
                // console.log(val)
                let temp = allpools.find(p =>
                    p.lpSymbol == val[0]
                );
                if (temp) {
                    userPools.push({ ...temp, lpBalance: val[1] })
                }
            }
            // console.log(userPools)
            // TODO show your liquidity pools
            // const pools = await dispatch("formatPoolList", tableResults.rows);
            commit("setUserLiquidityPools", userPools);
        }
    } catch (error) {
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
            show_payer: false
        });

        commit("setConfig", config.rows[0]);
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
}