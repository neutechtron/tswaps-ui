export const getAllPools = ({ pools }) => pools;

export const getPoolTokens = ({ poolTokens }) => poolTokens;

export const getAllPoolIDs = ({ pools }) => pools.map((a) => a.id);

export const getPoolByID =
  ({ pools }) =>
  (id) =>
    pools.find((el) => el.id === id);

// sorts closest to furthest openening date
export const getPoolIDsByStatus =
  ({ pools }) =>
  (pool_status) =>
    pools
      .filter((a) => a.pool_status === pool_status)
      .sort((a, b) => {
        return new Date(a.pool_open) - new Date(b.pool_open);
      })
      .map((a) => a.id);

export const getPoolsByStatus =
  ({ pools }) =>
  (pool_status) =>
    pools
      .filter(
        (a) =>
          a.pool_status === pool_status &&
          (a.status === "published" || a.status === "success")
      )
      .sort((a, b) => {
        return new Date(a.pool_open) - new Date(b.pool_open);
      });

export const getPoolByIDChain =
  ({ pools }) =>
  (id, chain) =>
    pools.find((el) => el.id === id && el.chain === chain);

export const getCommentsByPoolID =
  ({ pools }) =>
  (id) =>
    pools.find((el) => el.id === id);

export const getCreatedPoolIDs =
  ({ pools }) =>
  (owner) =>
    pools
      .filter((el) => el.owner === owner)
      .sort((a, b) => {
        return new Date(b.public_end) - new Date(a.public_end);
      })
      .map((a) => a.id);

export const getCreatedPools =
  ({ pools }) =>
  (owner, chain) =>
    pools
      .filter((el) => el.owner === owner && el.chain === chain)
      .sort((a, b) => {
        return new Date(b.public_end) - new Date(a.public_end);
      });

export const getPublishedPoolIDs = ({ pools }) =>
  pools
    .filter((a) => a.status === "published" || a.status === "success")
    .sort((a, b) => {
      return new Date(a.pool_open) - new Date(b.pool_open);
    })
    .map((a) => a.id);

export const getPublishedPools = ({ pools }) =>
  pools
    .filter((a) => a.status === "published" || a.status === "success")
    .sort((a, b) => {
      return new Date(a.pool_close) - new Date(b.pool_close);
    });