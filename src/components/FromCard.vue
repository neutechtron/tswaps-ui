<template>
  <q-card class="inputCard">
    <div class="row justify-between">
      <div>From</div>
      <div v-if="isAuthenticated">Balance: -</div>
    </div>
    <div class="row flex-wrap">
      <input-amount class="col-xs-12 col-sm-6" />
      <coin-selector class="col-xs-6 col-sm-3" />
      <div class="col-xs-6 col-sm-3">Network</div>
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
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  }
};
</script>

<style lang="scss" scoped></style>
