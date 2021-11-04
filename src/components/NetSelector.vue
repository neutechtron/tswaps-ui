<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showNetDialog = !showNetDialog"
  >
    <div class="imgWrapper row justify-center items-center">
      <token-avatar :token="selectedNetwork" :avatarSize="40" />
    </div>
    <div class="text-h6 q-mx-sm">{{ selectedNetwork }}</div>
    <dropdown-btn />
    <net-dialog
      :showNetDialog.sync="showNetDialog"
      :netOptions="networkOptions"
      :selectedNet="selectedNetwork"
      @updateSelectedNet="$emit('update:selectedNetwork', $event)"
    />
  </div>
</template>

<script>
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import netDialog from "src/components/NetDialog";
export default {
  components: { dropdownBtn, tokenAvatar, netDialog },
  props: {
    selectedNetwork: String,
    networkOptions: Array
  },
  data() {
    return {
      showNetDialog: false
    };
  }
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
