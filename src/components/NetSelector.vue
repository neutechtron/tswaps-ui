<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showNetDialog = !showNetDialog"
  >
    <div class="imgWrapper row justify-center items-center">
      <token-avatar :token="selectedNetwork" :avatarSize="40" />
    </div>
    <div class="text-h6 q-mx-xs">{{ selectedNetwork }}</div>
    <dropdown-btn />
    <net-dialog :showNetDialog.sync="showNetDialog" :isFrom="isFrom" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import netDialog from "src/components/NetDialog";
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
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain"]),
    selectedNetwork() {
      let chain = this.getToChain;
      if (this.isFrom) chain = this.getFromChain;
      if (chain.NETWORK_DISPLAY_NAME) return chain.NETWORK_DISPLAY_NAME;
      else return "";
    }
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
