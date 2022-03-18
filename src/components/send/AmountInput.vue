<template>
  <q-input
    outlined
    bottom-slots
    :suffix="selectedTokenSym"
    :value="amount"
    @input="updateAmount($event)"
    label="Amount"
    maxlength="12"
    class="col"
    :rules="[validateInputAmount]"
    no-error-icon
  >
    <template v-slot:append>
      <q-btn
        label="Max"
        color="positive"
        class="hover-accent"
        outline
        @click="updateAmount(balance)"
      />
    </template>
  </q-input>
</template>

<script>
export default {
  props: {
    selectedToken: Object,
    selectedTokenSym: String,
    amount: Number,
    balance: Number,
    min: { type: Number, default: 0 }
  },
  data() {
    return {};
  },
  methods: {
    validateInputAmount(val) {
      return (
        (val <= this.balance) & (val > 0) & (val >= this.min) & !isNaN(val) ||
        "Incorrect amount"
      );
    },
    updateAmount(val) {
      const res = isNaN(val) ? null : Number(val);
      this.$emit("update:amount", res);
    }
  }
};
</script>
