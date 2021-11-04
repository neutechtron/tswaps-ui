import Vue from "vue";
import Vuex from "vuex";

import account from "./account";
import general from "./general";
import blockchains from "./blockchains";

Vue.use(Vuex);

export default function() {
  const Store = new Vuex.Store({
    modules: {
      general,
      account,
      blockchains
    },

    strict: process.env.DEV
  });

  return Store;
}
