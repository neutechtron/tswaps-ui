<template>
  <div class="selectorContainer row items-center no-wrap">
    <div class="imgWrapper row justify-center items-center">
      <token-avatar :token="selectedNetwork" :avatarSize="40" />
    </div>
    <div class="text-h5 q-mx-sm">{{ selectedNetwork }}</div>
    <dropdown-btn />
  </div>
</template>

<script>
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { dropdownBtn, tokenAvatar },
  props: {
    selectedNetwork: String,
    networkOptions: Array
  },
  setup() {}
};
</script>

<style lang="scss" scoped>
.imgWrapper {
  background: $white;
  border-radius: 100%;
  max-width: 3rem;
  max-height: 3rem;
}
</style>
