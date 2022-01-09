<template>
  <div>
    <q-input
      :value="isFrom ? getAmount : getToEstimate"
      @input="isFrom ? updateAmount($event) : null"
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
      v-bind:class="{ disabled: !isFrom }"
      
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
    ...mapGetters("swap", ["getAmount", "getToEstimate"])
  },
  methods: {
    ...mapActions("swap", ["updateAmount"])
  }
};
</script>

<style lang="scss" scoped></style>
