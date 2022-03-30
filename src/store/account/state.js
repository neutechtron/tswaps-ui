export default function () {
  return {
    accountName: null,
    hasProfile: false,
    profiles: {},
    autoLogin: false,
    loading: {},
    wallet: [
      {
        token_sym: "START",
        token_contract: "token.start",
        balance: 0,
        liquid: 0,
        staked: 0,
        unstaking: 0,
        decimals: 4,
        claimable: 0,
        avatar:
          "https://raw.githubusercontent.com/T-Starter/T-Starter-images/master/icons/STAR.png",
        stake_maturities: [],
      },
    ],
  };
}
