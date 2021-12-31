<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">To (Estimate)</div>
      <div class="text-subtitle1" v-if="isAuthenticated">
        Balance: {{ balance }}
      </div>
    </div>
    <div class="row flex-wrap items-end">
      <input-amount class="col-xs-12 col-sm-6 col-md-6 q-mt-sm" />
      <div class="col-xs-12 col-sm-6 col-md-6 row justify-stretch q-mt-sm">
        <coin-selector class="col q-mr-sm" isFrom />
      </div>
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import inputAmount from "src/components/InputAmount";
import coinSelector from "src/components/CoinSelector";
export default {
  components: { inputAmount, coinSelector },
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
  }
};
</script>

<style lang="scss" scoped></style>
