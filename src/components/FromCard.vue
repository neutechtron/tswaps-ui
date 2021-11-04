<template>
  <q-card class="inputCard">
    <div class="row justify-between">
      <div>From</div>
      <div v-if="isAuthenticated">Balance: -</div>
    </div>
    <div class="row flex-wrap">
      <input-amount class="col-sm-12 col-md-6 q-mt-sm" />
      <div class="col-sm-12 col-md-6 row justify-end q-mt-sm">
        <coin-selector class="q-mr-sm" isFrom />
        <net-selector isFrom />
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
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  }
};
</script>

<style lang="scss" scoped></style>
