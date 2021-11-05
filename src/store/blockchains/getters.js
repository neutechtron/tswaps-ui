export const getCurrentChain = ({ currentChain }) => currentChain;
export const getNetworkByName = ({ blockchainList }) => NETWORK_NAME =>
  blockchainList.filter(el => el.NETWORK_NAME === NETWORK_NAME);
export const getAllChains = ({ blockchainList }) => blockchainList;
export const getAllPossibleChains = ({ blockchainList }) =>
  blockchainList.filter(
    el => el.TEST_NETWORK === (process.env.TESTNET == "true")
  );
