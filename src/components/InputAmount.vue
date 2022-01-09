<template>
  <div>
    <q-input
      v-if="isSwap"
      :value="isFrom ? getAmount : getToEstimate"
      @input="isFrom ? updateValue($event) : null"
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
      v-bind:class="{ disabled: !isFrom}"
      
    />
    <q-input
      v-else
      :value="isFrom ? getValue1 : getValue2"
      @input="updateValue($event)"
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
  props: ["isSwap", "isFrom"],
  data() {
    return {
      showCoinDialog: false,
      amount: ""
    };
  },
  computed: {
    ...mapGetters("swap", ["getAmount", "getToEstimate"]),
    ...mapGetters("liquidity", ["getValue1", "getValue2"]),
  },
  methods: {
    ...mapActions("swap", ["updateAmount"]),
    ...mapActions("liquidity", ["updateValue1", "updateValue2"]),
    async updateValue(value){
      if(this.isSwap){
        this.updateAmount(value)
      } else {
        if(this.isFrom) {
          this.updateValue1(value)
        } else {
          this.updateValue2(value) 
        }
      }
    }

  }
};
</script>

<style lang="scss" scoped></style>
