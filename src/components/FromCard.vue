<template>
  <q-card class="inputCard">
    <div class="row justify-between">
      <div>From</div>
      <div v-if="isAuthenticated">Balance: 0 TLOS</div>
    </div>
    <div class="row flex-wrap">
      <input-amount class="col-xs-12 col-sm-6" />
      <div class="col-3">Coin</div>
      <div class="col-3">Network</div>
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import inputAmount from "src/components/InputAmount";
export default {
  components: { inputAmount },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  }
};
</script>

<style lang="scss" scoped></style>
