<template>
  <q-page class="column justify-center q-gutter-y-md">
    <from-card></from-card>
    <div class="text-center">
      <q-icon class="swapArrow" name="fas fa-arrow-down" size="1.5rem" />
    </div>
    <q-card class="inputCard"></q-card>
  </q-page>
</template>

<script>
import fromCard from "src/components/FromCard";

export default {
  name: "Index",
  components: { fromCard }
};
</script>

<style lang="scss" scoped>
body.body--light {
  .swapArrow {
    color: $dark-0;
  }
}

body.body--dark {
  .swapArrow {
    color: $cyan;
  }
}
</style>
