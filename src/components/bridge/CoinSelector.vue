<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showCoinDialog = !showCoinDialog"
  >
    <token-avatar
      :token="getToken.symbol.toString()"
      :avatarSize="40"
    />
    <div class="text-h6 q-mx-sm">
      {{ getToken.symbol.toString() }}
    </div>
    <div class="col row justify-end">
      <dropdown-btn />
    </div>
    <coin-dialog
      :showCoinDialog.sync="showCoinDialog"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import coinDialog from "./CoinDialog";
export default {
  components: { dropdownBtn, tokenAvatar, coinDialog },
  data() {
    return {
      showCoinDialog: false
    };
  },
  computed: {
    ...mapGetters("bridge", ["getToken"])
  }
};
</script>

<style lang="scss" scoped></style>
