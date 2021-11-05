<template>
  <q-dialog
    :value="showNetDialog"
    @input="$emit('update:showNetDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="row justify-between items-center">
        <q-item-label header class="text-h6">Select a network</q-item-label>
        <div class="q-pr-sm">
          <q-btn size="12px" flat dense round icon="clear" v-close-popup />
        </div>
      </div>
      <q-separator />
      <q-item
        v-for="net in chainOptions"
        :key="net.NETWORK_CHAIN_ID"
        clickable
        v-close-popup
        @click="updateSelectedNet(net)"
      >
        <q-item-section avatar>
          <token-avatar :token="net.NETWORK_NAME" :avatarSize="30" />
        </q-item-section>
        <q-item-section>
          {{ net.NETWORK_DISPLAY_NAME }}
        </q-item-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  props: ["showNetDialog", "isFrom"],
  methods: {
    async updateSelectedNet(chain) {
      if (this.isFrom) {
        await this.$store.commit("bridge/setFromChain", chain); // TODO Switch chain
      } else {
        await this.$store.commit("bridge/setToChain", chain);
      }
      this.$emit("update:showNetDialog", false);
    }
  },
  computed: {
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    selectedChain() {
      return this.isFrom ? this.getFromChain : this.getToChain;
    },
    chainOptions() {
      return this.getAllPossibleChains;
      // if (this.isAuthenticated) {
      //   return this.getAllPossibleChains.filter(
      //     el => el.NETWORK_CHAIN_ID !== this.selectedChain.NETWORK_CHAIN_ID
      //   );
      // } else {
      //   return this.getAllPossibleChains;
      // }
    }
  },
  beforeMount() {
    this.$store.commit("bridge/setFromChain", this.getCurrentChain);
  }
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
}
</style>
