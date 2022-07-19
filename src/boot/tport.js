const mainnetList = [
  {
    name: "Ethereum",
    remoteId: 1,
    chainName: "Ethereum Mainnet",
    chainId: 1,
    rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io"],
    vaultContract: "",
  },
  {
    name: "BSC",
    remoteId: 2,
    chainName: "Binance Smart Chain Mainnet",
    chainId: 56,
    rpcUrls: ["https://bsc-dataseed1.ninicoin.io"],
    nativeCurrency: {
      name: "BINANCE COIN",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://bscscan.com"],
    vaultContract: "0x60f20815aa24B07b3Ec7B64624B65e338aaA85e5",
  },
    {
        name: "Telos EVM",
        remoteId: 3,
        chainName: "Telos EVM Mainnet",
        chainId: 40,
        rpcUrls: ["https://mainnet.telos.net/evm"],
        nativeCurrency: {
            name: "TLOS",
            symbol: "TLOS",
            decimals: 18,
        },
        blockExplorerUrls: ["https://teloscan.io"],
        vaultContract: "",
    },
];

const testnetList = [
  {
    name: "Ethereum",
    remoteId: 1,
    chainName: "Ropsten Test Network",
    chainId: 3,
    rpcUrls: ["https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    nativeCurrency: {
      name: "Ropsten ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
    vaultContract: "0x02289E8B9d13C02a853620eff978821b3f0193F6",
  },
  {
    name: "BSC",
    remoteId: 2,
    chainName: "Binance Smart Chain Testnet",
    chainId: 97,
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    nativeCurrency: {
      name: "BINANCE COIN",
      symbol: "tBNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    vaultContract: "0x5213fcB1Cf69B029A32F9454fD29f2a500af569a",
  },
  {
    name: "Telos EVM",
    remoteId: 3,
    chainName: "Telos Testnet",
    chainId: 41,
    rpcUrls: ["https://testnet.telos.net/evm"],
    nativeCurrency: {
      name: "TLOS",
      symbol: "TLOS",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.teloscan.io/"],
    vaultContract: "",
  },
];

export default async ({ store }) => {
  const networkList = process.env.TESTNET == "true" ? testnetList : mainnetList;
  store.commit("tport/setNetworkList", { networkList });
  store.commit("xchain/setNetworkList", { networkList });
};
