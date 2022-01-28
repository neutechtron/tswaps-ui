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
                token0_symbol: this.$exSymToSymbol(res0),
                token1_symbol: this.$exSymToSymbol(res1),
                reserve0: {
                    quantity: this.$getQuantity(res0),
                    symbol: this.$exSymToSymbol(res0),
                    precision: this.$exSymToPrecision(res0),
                    contract: res0.contract
                },
                reserve1: {
                    quantity: this.$getQuantity(res1),
                    symbol: this.$exSymToSymbol(res1),
                    precision: this.$exSymToPrecision(res1),
                    contract: res1.contract
                },
                contract0: res0.contract,
                contract1: res1.contract,
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

export const updatePools = async function ({ commit, rootGetters, dispatch }) {
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

        // console.log(tableResults.rows);

        const pools = await dispatch("formatPoolList", tableResults.rows);

        commit("setPools", pools);
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateUserLiquidityPools = async function (
    { commit, rootGetters },
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

            const pools = lpTokens;
            // const pools = formatPoolList(lpTokens);
            commit("setUserLiquidityPools", pools);
        }
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};
