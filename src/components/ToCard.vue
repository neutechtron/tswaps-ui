<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">TO</div>
      <div class="text-subtitle1" v-if="isAuthenticated">Balance: {{toBalance !== undefined ? toBalance : "-"}}</div>
    </div>
    <div class="column ">
      <div class="row items-end">
        <q-input
          v-model="toAccount"
          placeholder="Account"
          class="col-12 col-md-9"
          counter
          maxlength="12"
          :rules="[accountExistsOnChain]"
          error-message="Account does not exist"
          lazy-rules
          debounce="1000"
        />

        <div class="col-12 col-md-3 row justify-stretch q-mt-sm">
          <net-selector class="col" />
        </div>
      </div>
      <q-input v-model="memo" placeholder="Memo" debounce="500" />
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
import { Api, JsonRpc, Serialize } from "eosjs";

export default {
  components: { netSelector },
  data() {
    return {
      toAccount: "",
      memo: "",
      toBalance: undefined
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("bridge", ["getToChain", "getToken", "getToChain"])
  },
  watch: {
    async toAccount() {
      await this.toCurrencyBalance();
      this.$store.commit("bridge/setToAccount", this.toAccount);
    },
    memo() {
      this.$store.commit("bridge/setMemo", this.memo);
    }
  },
  methods: {
    async accountExistsOnChain(account) {
      //set rpc
      const rpc = new JsonRpc(
        `${this.getToChain.NETWORK_PROTOCOL}://${this.getToChain.NETWORK_HOST}:${this.getToChain.NETWORK_PORT}`
      );
      //check if account exists on chain
      let exists = await rpc.get_account(account);
      return exists;
    },
    
    async toCurrencyBalance() {
      //set rpc
      const rpc = new JsonRpc(
        `${this.getToChain.NETWORK_PROTOCOL}://${this.getToChain.NETWORK_HOST}:${this.getToChain.NETWORK_PORT}`
      );
      //get balance
      let toToken = this.getToken.toTokens.find(c => c.chain === this.getToChain.NETWORK_NAME.toLowerCase())
      let balance = (
        await rpc.get_currency_balance(
          toToken.contract,
          this.toAccount,
          toToken.symbol
        )
      )[0];
      console.log(balance);
      //return balance
      this.toBalance = this.$assetToAmount(balance);
    }
  }
};
</script>

<style lang="scss" scoped></style>
