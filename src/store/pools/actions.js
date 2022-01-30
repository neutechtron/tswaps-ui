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
            console.log(allpools)
            console.log(lpTokens)

            for (const token of lpTokens)
            {
                console.log(token)
                let val = this.$exBalanceSymbol(token)
                console.log(val)
                let temp = allpools.find(p => 
                    p.lpSymbol == val[0]
                );
                if (temp){
                    userPools.push({...temp,lpBalance:val[1]})
                }
            }
            console.log(userPools)
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