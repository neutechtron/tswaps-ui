<template>
  <q-dialog
    :value="showCoinDialog"
    @input="$emit('update:showCoinDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="row justify-between items-center">
        <q-item-label header class="text-h6">Select a token</q-item-label>
        <div class="q-pr-sm">
          <q-btn size="12px" flat dense round icon="clear" v-close-popup />
        </div>
      </div>
      <q-item>
        <q-input
          outlined
          round
          placeholder="Search token name or symbol"
          class="col"
        />
      </q-item>
      <q-separator />
      <q-item
        v-for="token in getBridgeTokens"
        :key="`${token.chain}-${token.contract}-${token.symbol}`"
        clickable
        v-close-popup
        @click="updateSelectedCoin(token)"
      >
        <q-item-section avatar>
          <token-avatar :token="token.symbol" :avatarSize="30" />
        </q-item-section>
        <q-item-section>
          <q-item-label> {{ token.symbol }}</q-item-label>
          <q-item-label caption>{{ token.contract }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="getBridgeTokens.length == 0">No tokens found</q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  props: ["showCoinDialog", "isFrom"],
  methods: {
    updateSelectedCoin(token) {
      this.$store.commit("bridge/setToken", token);
    }
  },
  computed: {
    ...mapGetters("tokens", ["getBridgeTokens"])
  }
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
}
</style>
