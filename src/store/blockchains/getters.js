export const currentChain = ({ currentChain }) => currentChain;
export const getNetworkByName = ({ blockchainList }) => NETWORK_NAME =>
  blockchainList.filter(el => el.NETWORK_NAME === NETWORK_NAME);
export const allBlockchains = ({ blockchainList }) => blockchainList;
export const getBridgeTokens = ({ bridgeTokens }) => bridgeTokens;
