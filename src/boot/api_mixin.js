import { Api, JsonRpc } from "eosjs";

const signTransaction = async function(actions) {
  actions.forEach(action => {
    if (!action.authorization || !action.authorization.length) {
      action.authorization = [
        {
          actor: this.state.account.accountName,
          permission: "active"
        }
      ];
    }
  });
  let transaction = null;
  try {
    if (this.$type === "ual") {
      transaction = await this.$ualUser.signTransaction(
        {
          actions
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      );
    }
  } catch (e) {
    console.log(actions, e.cause.message);
    throw e.cause.message;
  }
  return transaction;
};

const getRpc = function() {
  return this.$type === "ual" ? this.$ualUser.rpc : this.$defaultApi.rpc;
};

const getTableRows = async function(options) {
  const rpc = this.$api.getRpc();
  return await rpc.get_table_rows({
    json: true,
    ...options
  });
};

const getAccount = async function(accountName) {
  const rpc = this.$api.getRpc();
  return await rpc.get_account(accountName);
};

export default {
  methods: {
    async setAPI() {
      console.log("new API")
      if (localStorage.getItem("selectedChain") != null) {
        await this.$store.dispatch(
          "blockchains/updateCurrentChain",
          localStorage.getItem("selectedChain")
        );
      } else {
        await this.$store.dispatch("blockchains/updateCurrentChain", "TELOS");
      }
      let getCurrentChain = this.$store.getters["blockchains/getCurrentChain"];
      
      const rpc = new JsonRpc(
        `${getCurrentChain.NETWORK_PROTOCOL}://${getCurrentChain.NETWORK_HOST}:${getCurrentChain.NETWORK_PORT}`
      );
      this.$store["$defaultApi"] = new Api({
        rpc,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
      });

      this.$store["$api"] = {
        signTransaction: signTransaction.bind(this.$store),
        getTableRows: getTableRows.bind(this.$store),
        getAccount: getAccount.bind(this.$store),
        getRpc: getRpc.bind(this.$store)
      };
    }
  }
};
