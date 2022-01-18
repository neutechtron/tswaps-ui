<template>
  <div>
    <q-input
      :value="amount == 0 ? '' : amount.toString()"
      @input="updateAmount($event)"
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
  props: { amount: Number },
  data() {
    return {};
  },
  methods: {
    updateAmount(val) {
      this.$emit("update:amount", isNaN(val) ? 0 : parseFloat(val));
    }
  }
};
</script>

<style lang="scss" scoped></style>
