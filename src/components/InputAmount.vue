<template>
  <div>
    <q-input
      v-model="amount"
      debounce="500"
      placeholder="0.0"
      pattern="^[0-9]*[.,]?[0-9]*$"
      inputmode="decimal"
      autocomplete="off"
      autocorrect="off"
      title="Amount"
      type="text"
      minlength="1"
      maxlength="79"
      spellcheck="false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    isFrom: Boolean
  },
  data() {
    return {
      showCoinDialog: false,
      amount: ""
    };
  },
  computed: {
    ...mapGetters("bridge", ["getToken"])
  },
  watch: {
    amount() {
      this.$store.commit("bridge/setAmount", this.amount);
    }
  }
};
</script>

<style lang="scss" scoped></style>
