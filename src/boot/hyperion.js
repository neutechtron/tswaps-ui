import axios from "axios";

let hyperion = null;

export default async ({ Vue, store }) => {
  if (localStorage.getItem("selectedChain") != null) {
    await store.dispatch(
      "blockchains/updateCurrentChain",
      localStorage.getItem("selectedChain")
    );
  } else {
    await store.dispatch("blockchains/updateCurrentChain", "TELOS");
  }
  let currentChain = store.getters["blockchains/getCurrentChain"];
  console.log(currentChain)

  hyperion = axios.create({
    baseURL: currentChain.HYPERION_ENDPOINT
  });

  Vue.prototype.$hyperion = hyperion;
  store["$hyperion"] = hyperion;
};

export { hyperion };
