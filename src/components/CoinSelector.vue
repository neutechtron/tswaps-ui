<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showCoinDialog = !showCoinDialog"
  >
    <token-avatar v-if="isSwap" :token="isFrom ? getFromToken.symbol.toString() : getToToken.symbol.toString() " :avatarSize="40" />
    <token-avatar v-else :token="isFrom ? getToken1.symbol.toString() : getToken2.symbol.toString() " :avatarSize="40" />
    <div v-if="isSwap" class="text-h6 q-mx-sm">{{ isFrom ? getFromToken.symbol.toString() : getToToken.symbol.toString() }}</div>
    <div v-else class="text-h6 q-mx-sm">{{ isFrom ? getToken1.symbol.toString() : getToken2.symbol.toString() }}</div>
    <div class="col row justify-end">
      <dropdown-btn />
    </div>
    <coin-dialog :showCoinDialog.sync="showCoinDialog" :isFrom="isFrom" :isSwap="isSwap" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import coinDialog from "src/components/CoinDialog";
export default {
  components: { dropdownBtn, tokenAvatar, coinDialog },
  props: ["isFrom", "isSwap"],
  data() {
    return {
      showCoinDialog: false
    };
  },
  computed: {
    ...mapGetters("swap", ["getFromToken", "getToToken"]),
    ...mapGetters("liquidity", ["getToken1", "getToken2"])
  }
};
</script>

<style lang="scss" scoped></style>
