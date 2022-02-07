<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">Input</div>
      <div
        class="text-subtitle1"
        style="cursor: pointer"
        @click="updateValue1(balance)"
        v-if="isAuthenticated"
      >
        Balance: {{ balance }}
      </div>
    </div>
    <div class="row flex-wrap items-center">
      <input-amount
        class="col-xs-12 col-sm-6 col-md-6 q-mt-xs"
        :amount="getValue1"
        @update:amount="updateValue1($event)"
      />
      <div class="col-xs-12 col-sm-6 col-md-6 row justify-stretch q-mt-xs">
        <coin-selector class="col q-mr-sm" :is-from="true" />
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
    ...mapGetters("liquidity", ["getValue1", "getValue2", "getToken1"]),
    ...mapGetters("tokens", ["getTokens"]),

    balance() {
      if (this.getTokens.find((token) => token.id === this.getToken1.id)) {
        return this.getToken1.amount;
      } else {
        return 0;
      }
    },
  },
  methods: {
    ...mapActions("liquidity", ["updateValue1", "updateValue2"]),
  },
};
</script>

<style lang="scss" scoped></style>
