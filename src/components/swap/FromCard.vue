<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">From</div>
      <div
        class="text-subtitle1"
        style="cursor: pointer"
        @click="updateAmount(balance)"
        v-if="isAuthenticated"
      >
        Balance: {{ balance }}
      </div>
    </div>
    <div class="row flex-wrap items-center">
      <input-amount
        class="col-xs-12 col-sm-6 col-md-6 q-mt-xs"
        :amount="getAmount"
        @update:amount="updateAmount($event)"
      />
      <div class="col-xs-12 col-sm-6 col-md-6 row justify-stretch q-mt-xs">
        <coin-selector class="col q-mr-sm" :is-from="true" :is-swap="true" />
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
    return { amount: "", errorMessage: "" };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("swap", [
      "getAmount",
      "getFromToken",
      "getPool",
      "getCanSwap",
    ]),
    ...mapGetters("tokens", ["getTokens"]),

    balance() {
      if (this.getTokens.find((token) => token.id === this.getFromToken.id)) {
        return this.getFromToken.amount;
      } else {
        return 0;
      }
    },
  },
  methods: {
    ...mapActions("swap", ["updateAmount"]),
  },
};
</script>

<style lang="scss" scoped></style>
