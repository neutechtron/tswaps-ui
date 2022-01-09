<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showCoinDialog = !showCoinDialog"
  >
    <token-avatar :token="isFrom ? getFromToken.symbol.toString() : getToToken.symbol.toString() " :avatarSize="40" />
    <div class="text-h6 q-mx-sm">{{ isFrom ? getFromToken.symbol.toString() : getToToken.symbol.toString() }}</div>
    <div class="col row justify-end">
      <dropdown-btn />
    </div>
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
  props: ["isFrom"],
  data() {
    return {
      showCoinDialog: false
    };
  },
  computed: {
    ...mapGetters("swap", ["getFromToken", "getToToken"])
  }
};
</script>

<style lang="scss" scoped></style>
