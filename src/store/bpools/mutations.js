export const setPoolSettings = (
  state,
  { id, pool_status, access_type, progress, chain }
) => {
  let pool = state.pools.find(el => el.id === id && el.chain === chain);
  pool.pool_status = pool_status;
  pool.access_type = access_type;
  pool.progress = progress;
};

export const updatePoolOnState = (state, { poolTable }) => {
  if (!poolTable) {
    console.error("No pool table");
    return;
  }
  // console.log(poolTable);

  // if pool in store update, else push
  if (
    state.pools.some(a => a.id === poolTable.id && a.chain === poolTable.chain)
  ) {
    // state.pools[state.pools.findIndex(el => el.id === poolTable.id && el.chain === poolTable.chain)] = poolTable;
    const index = state.pools.findIndex(
      el => el.id === poolTable.id && el.chain === poolTable.chain
    );
    state.pools[index] = poolTable;
    state.pools = [...state.pools];
  } else {
    state.pools.push(poolTable);
    // console.log(poolTable);
  }
};

export const setPoolSentimentTable = (
  state,
  { id, sentiment_table, chain }
) => {
  let pool = state.pools.find(el => el.id === id && el.chain === chain);
  pool.sentiment_table = sentiment_table;
};

export const setPoolCommentsTable = (state, { id, comments_table, chain }) => {
  let pool = state.pools.find(el => el.id === id && el.chain === chain);
  pool.comments_table = comments_table;
};

export const updateSingleComment = (
  state,
  { pool_id, comment_id, value, chain }
) => {
  let pool = state.pools.find(el => el.id === pool_id && el.chain === chain);
  pool.comments_table.find(el => el.id === comment_id).comment = value;
};

export const updatePoolTokens = (state, { poolTokens }) => {
  state.poolTokens = poolTokens;
};
