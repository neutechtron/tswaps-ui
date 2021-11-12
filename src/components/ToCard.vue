<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">TO</div>
      <div class="text-subtitle1" v-if="isAuthenticated">Balance: -</div>
    </div>
    <div class="column ">
      <div class="row items-end">
        <q-input
          v-model="toAccount"
          placeholder="Account"
          debounce="500"
          class="col-12 col-md-9"
        />

        <div class="col-12 col-md-3 row justify-stretch q-mt-sm">
          <net-selector class="col" />
        </div>
      </div>
      <q-input v-model="memo" placeholder="Memo" debounce="500" />
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
export default {
  components: { netSelector },
  data() {
    return {
      toAccount: "",
      memo: ""
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },
  watch: {
    toAccount() {
      this.$store.commit("bridge/setToAccount", this.toAccount);
    },
    memo() {
      this.$store.commit("bridge/setMemo", this.memo);
    }
  }
};
</script>

<style lang="scss" scoped></style>
