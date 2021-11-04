<template>
  <div>
    <input
      inputmode="decimal"
      title="Amount"
      autocomplete="off"
      autocorrect="off"
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder="0.0"
      minlength="1"
      maxlength="79"
      spellcheck="false"
    />
  </div>
</template>

<style lang="scss" scoped>
body.body--light {
  input {
    border-color: rgba($dark, 0.8);
    color: $dark;
  }
}

body.body--dark {
  input {
    border-color: rgba($white, 0.8);
    color: $white;
    &::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: $white;
      opacity: 1; /* Firefox */
    }

    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: $white;
    }

    &::-ms-input-placeholder {
      /* Microsoft Edge */
      color: $white;
    }
  }
}

input {
  width: 100%;
  background: transparent;
  border-top: none;
  border-right: none;
  border-left: none;
  border-bottom-width: 1px;
  font-size: 3rem;
  &:focus-visible {
    outline: none;
  }
}
</style>
