import Vue from "vue";
import Vuex from "vuex";

import account from "./account";
import general from "./general";
import blockchains from "./blockchains";
import tokens from "./tokens";
import bridge from "./bridge";
import pools from "./pools";

Vue.use(Vuex);

export default function() {
  const Store = new Vuex.Store({
    modules: {
      general,
      account,
      blockchains,
      tokens,
      bridge,
      pools
    },

    strict: process.env.DEV
  });

  return Store;
}
