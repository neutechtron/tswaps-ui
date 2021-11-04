<template>
  <q-page class="column justify-center q-gutter-y-md">
    <from-card />
    <div class="text-center">
      <q-icon class="swapArrow" name="fas fa-arrow-down" size="1.5rem" />
    </div>
    <to-card />
    <div class="flex justify-center">
      <q-btn no-caps class="sendBtn self-center" label="Send" />
    </div>
  </q-page>
</template>

<script>
import fromCard from "src/components/FromCard";
import toCard from "src/components/ToCard";

export default {
  name: "Index",
  components: { fromCard, toCard }
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
  .sendBtn {
    background: $cyan;
  }
}

.sendBtn {
  color: $dark-0;
  flex-basis: 400px;
  height: 3rem;
}
</style>
