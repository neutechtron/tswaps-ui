export const getCurrentChain = ({ getCurrentChain }) => getCurrentChain;
export const getNetworkByName = ({ blockchainList }) => NETWORK_NAME =>
  blockchainList.filter(el => el.NETWORK_NAME === NETWORK_NAME);
export const getAllBlockchains = ({ blockchainList }) => blockchainList;

