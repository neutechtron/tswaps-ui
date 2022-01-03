import { Api, JsonRpc } from "eosjs";

export async function updatePools({ commit }){
    try {
        const pools = []
        commit("setPools", pools);
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
}

export async function updateUserLiquidityPools({ commit }, accountName) {
    try {
        const pools = []
        commit("setUserLiquidityPools", pools);
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
}
