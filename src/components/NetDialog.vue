<template>
  <q-dialog
    :value="showNetDialog"
    @input="$emit('update:showNetDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="dialogHeader ">
        <div class="row justify-between items-center q-py-sm">
          <div header class="text-h6 q-pl-md">Select a network</div>
          <div class="q-pr-sm">
            <q-btn size="12px" flat dense round icon="clear" v-close-popup />
          </div>
        </div>
        <q-separator />
      </div>
      <q-list class="dialogList">
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
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import ual from "src/boot/ual_mixin";

export default {
  components: { tokenAvatar },
  mixins: [ual],
  props: ["showNetDialog", "isFrom"],
  computed: {
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain", "getToken"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    selectedChain() {
      return this.isFrom ? this.getFromChain : this.getToChain;
    },
    chainOptions() {
      if (this.getToken.toChain !== undefined && !this.isFrom) {
        return this.getAllPossibleChains.filter(
          el =>
            this.getToken.toChain
              .map(c => c.toUpperCase())
              .includes(el.NETWORK_NAME) ||
            el.NETWORK_NAME === this.getCurrentChain.NETWORK_NAME
        );
      } else {
        return this.getAllPossibleChains;
      }
    }
  },
  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    ...mapActions("blockchains", ["updateCurrentChain"]),

    async updateSelectedNet(chain) {
      if (this.isFrom) {
        if (
          chain.NETWORK_NAME.toUpperCase() !=
          localStorage.getItem("selectedChain")
        ) {
          if (this.isAuthenticated) {
            this.$q.notify({
              color: "info",
              textColor: "dark",
              icon: "info",
              message: "Log in to send"
            });
          }
          await this.logout();
          await this.updateCurrentChain(chain.NETWORK_NAME.toUpperCase());
          // await this.setAPI();
          // console.log(this.$store.$api)
          await this.$store.$api.setAPI(this.$store);
          await this.setUAL();
          this.$store.commit("tokens/clearTokens");
          this.$store.commit("bridge/setFromChain", chain);
        }
      } else {
        this.$store.commit("bridge/setToChain", chain);
      }
      this.$emit("update:showNetDialog", false);
    }
  },

  beforeMount() {
    this.$store.commit("bridge/setFromChain", this.getCurrentChain);
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
}
</style>
