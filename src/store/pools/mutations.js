export const setPools = (state, allPools) => {
  state.allPools = allPools;
};

export const setUserLiquidityPools = (state, userPools) => {
  state.userPools = userPools;
};

export const setIsLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};
