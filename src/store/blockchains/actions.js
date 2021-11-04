// set new chain
export const updateCurrentChain = async function(
  { commit, getters, dispatch },
  selectedChain
) {
  let blockchains = getters.getNetworkByName(selectedChain);
  let newChain = {};

  // check if testnet or not
  if (process.env.TESTNET == "true") {
    newChain = blockchains.find(el => el.TEST_NETWORK === true);
  } else {
    newChain = blockchains.find(el => el.TEST_NETWORK === false);
  }

  // console.log(blockchains)
  // console.log(newChain)

  commit("setCurrentChain", {
    newChain: newChain
  });

  localStorage.setItem("selectedChain", newChain.NETWORK_NAME);
};


