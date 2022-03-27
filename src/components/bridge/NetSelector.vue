<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showNetDialog = !showNetDialog"
  >
    <div class="imgWrapper row justify-center items-center">
      <token-avatar :token="selectedNetwork" :avatarSize="40" />
    </div>
    <div class="text-h6 q-mx-xs ellipsis">{{ selectedAccount }}</div>
    <div class="col row justify-end">
      <dropdown-btn />
    </div>
    <net-dialog :showNetDialog.sync="showNetDialog" :isFrom="isFrom" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import netDialog from "./NetDialog";
export default {
  components: { dropdownBtn, tokenAvatar, netDialog },
  props: {
    isFrom: Boolean
  },
  data() {
    return {
      showNetDialog: false
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain"]),
    ...mapGetters("tport", ["getEvmAccountName"]),
    selectedAccount() {
      let chain = this.getToChain;
      let fromAccount = this.getFromChain.NETWORK_DISPLAY_NAME === "Telos" ? this.accountName : this.getEvmAccountName
      let toAccount = this.getToChain.NETWORK_DISPLAY_NAME === "Telos" ? this.accountName : this.getEvmAccountName
      console.log(fromAccount, toAccount)
      if (!toAccount) toAccount = "";
      if (!fromAccount) fromAccount = "";
      if (this.isFrom) chain = this.getFromChain;
      if (!this.isFrom) chain = this.getToChain;
      if (this.isFrom && fromAccount !== "") return fromAccount;
      else if (!this.isFrom && toAccount !== "") return toAccount;
      else if (chain.NETWORK_DISPLAY_NAME) return chain.NETWORK_DISPLAY_NAME;
      else return "";
    },
    selectedNetwork() {
      let chain = this.getToChain;
      if (this.isFrom) chain = this.getFromChain;
      if (!this.isFrom) chain = this.getToChain;
      if (chain.NETWORK_DISPLAY_NAME) return chain.NETWORK_DISPLAY_NAME;
      else return "";
    }
  },
  mounted() {
    this.$store.commit("bridge/setFromChain", this.getAllPossibleChains[0]);
    this.$store.commit("bridge/setToChain", this.getAllPossibleChains[1]);
  }
};
</script>

<style lang="scss" scoped>
.imgWrapper {
  border-radius: 100%;
  max-width: 3rem;
  max-height: 3rem;
}
</style>
