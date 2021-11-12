<template>
  <q-dialog
    :value="showCoinDialog"
    @input="$emit('update:showCoinDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="dialogHeader ">
        <div class="row justify-between items-center q-pt-sm">
          <div class="text-h6 q-pl-md">Select a token</div>
          <div class="q-pr-sm">
            <q-btn size="12px" flat dense round icon="clear" v-close-popup />
          </div>
        </div>
        <q-item class="q-mb-sm">
          <q-input
            v-model="search"
            @input="filterTokens()"
            outlined
            round
            placeholder="Search contract name or symbol"
            class="col"
          />
        </q-item>
        <q-separator />
      </div>
      <q-list class="dialogList">
        <q-item
          v-for="token in availableTokens"
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
          <q-item-section>
            <q-item-label caption>{{ token.amount }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="getTokens.length == 0">No tokens found</q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  data() {
    return {
      search: "",
      filteredTokens: []
    };
  },
  props: ["showCoinDialog", "isFrom"],
  computed: {
    ...mapGetters("tokens", ["getTokens"]),
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    availableTokens() {
      if (this.filteredTokens.length > 0) {
        return this.filteredTokens;
      } else {
        return this.getTokens;
      }
    }
  },
  methods: {
    updateSelectedCoin(token) {
      this.$store.commit("bridge/setToken", token);
      let defaultToChain = {};
      if (token.toChain !== undefined) {
        console.log("token.toChain");
        defaultToChain = this.getAllPossibleChains.filter(el =>
          token.toChain.map(c => c.toUpperCase()).includes(el.NETWORK_NAME)
        )[0];
      } else {
        console.log("token.toChainelse");
        defaultToChain = this.getCurrentChain;
      }

      this.$store.commit("bridge/setToChain", defaultToChain);
    },

    filterTokens() {
      // TODO Show all when no input
      console.log("Len: ", this.search.length);
      if (this.search.length > 0) {
        console.log("text with filter");
        this.filterByText(this.getTokens);
      } else this.filteredTokens = this.getTokens;
    },
    filterByText(tokens) {
      this.filteredTokens = tokens.filter(token => {
        return (
          token.symbol.toLowerCase().includes(this.search.toLowerCase()) ||
          token.contract.toLowerCase().includes(this.search.toLowerCase())
        );
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
  height: 80vh;
}
</style>
