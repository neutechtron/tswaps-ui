<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showCoinDialog = !showCoinDialog"
  >
    <token-avatar :token="getSymbol.toString()" :avatarSize="40" />
    <div class="text-h6 q-mx-sm">{{ getSymbol }}</div>
    <dropdown-btn />
    <coin-dialog :showCoinDialog.sync="showCoinDialog" :isFrom="isFrom" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import coinDialog from "src/components/CoinDialog";
export default {
  components: { dropdownBtn, tokenAvatar, coinDialog },
  props: {
    isFrom: Boolean
  },
  data() {
    return {
      showCoinDialog: false
    };
  },
  computed: {
    ...mapGetters("bridge", ["getSymbol"])
  }
};
</script>

<style lang="scss" scoped></style>
