<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showCoinDialog = !showCoinDialog"
  >
    <token-avatar :token="selectedCoin" :avatarSize="40" />
    <div class="text-h5 q-mx-sm">{{ selectedCoin }}</div>
    <dropdown-btn />
    <coin-dialog
      :showCoinDialog.sync="showCoinDialog"
      :coinOptions="coinOptions"
      :selectedCoin="selectedCoin"
      @updateSelectedCoin="$emit('update:selectedCoin', $event)"
    />
  </div>
</template>

<script>
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import coinDialog from "src/components/CoinDialog";
export default {
  components: { dropdownBtn, tokenAvatar, coinDialog },
  props: {
    selectedCoin: String,
    coinOptions: Array
  },
  data() {
    return {
      showCoinDialog: false
    };
  }
};
</script>

<style lang="scss" scoped></style>
