<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">FROM</div>
      <div class="text-subtitle1" v-if="isAuthenticated">
        Balance:
        <span class="balanceAmount" @click="setToMaxAmount()">
          {{ balance }}
        </span>
      </div>
    </div>
    <div class="row flex-wrap items-end">
      <input-amount class="col-12 col-md-6 q-mt-sm" />
      <div class="col-12 col-md-6 row justify-stretch q-mt-sm">
        <coin-selector class="col q-mr-sm" isFrom />
        <net-selector class="col" isFrom />
      </div>
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import inputAmount from "src/components/InputAmount";
import coinSelector from "src/components/CoinSelector";
import netSelector from "src/components/NetSelector";
export default {
  components: { inputAmount, coinSelector, netSelector },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("bridge", ["getToken"]),
    ...mapGetters("tokens", ["getTokens"]),

    balance() {
      if (this.getTokens.find(token => token.id === this.getToken.id)) {
        return this.getToken.amount;
      } else {
        return 0;
      }
    }
  },
  methods: {
    setToMaxAmount() {
      this.$store.commit("bridge/setAmount", this.balance);
    }
  }
};
</script>

<style lang="scss" scoped>
.balanceAmount {
  cursor: pointer;
  &:hover {
    color: $accent;
  }
}
</style>
