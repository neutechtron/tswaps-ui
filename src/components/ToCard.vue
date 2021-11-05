<template>
  <q-card class="inputCard">
    <div class="row justify-between">
      <div>To</div>
      <div v-if="isAuthenticated">Balance: -</div>
    </div>
    <div class="column ">
      <div class="row ">
        <q-input placeholder="Account " class="col-xs-12 col-sm-9" />

        <div class="col-xs-12 col-sm-3 row justify-end q-mt-sm">
          <net-selector />
        </div>
      </div>
      <q-input placeholder="Memo" />
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
export default {
  components: { netSelector },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  }
};
</script>

<style lang="scss" scoped></style>
