<template>
  <div class="selectorContainer row items-center no-wrap">
    <token-avatar :token="selectedCoin" :avatarSize="40" />
    <div class="text-h5 q-mx-sm">{{ selectedCoin }}</div>
    <dropdown-btn />
  </div>
</template>

<script>
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { dropdownBtn, tokenAvatar },
  props: {
    selectedCoin: String,
    coinOptions: Array
  },
  setup() {}
};
</script>

<style lang="scss" scoped></style>
