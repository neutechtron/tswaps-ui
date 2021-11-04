<template>
  <div class="arrowButton row justify-center items-center">
    <q-icon class="fas fa-chevron-down" />
  </div>
</template>

<style lang="scss" scoped>
body.body--light {
  .arrowButton {
    background: rgba($dark, 0.2);
  }
}

body.body--dark {
  .arrowButton {
    background: rgba($white, 0.2);
  }
}

.arrowButton {
  border-radius: 100%;
  min-width: 1.5rem;
  min-height: 1.5rem;
}
</style>
