<template>
  <div class="bridgeDash">
    <q-card class="swapCard column items-start q-px-lg q-py-md" flat>
      <div class="text-h6 q-mb-sm self-center text-center">Attention</div>
      <q-list class="text-body2">
        <q-item dense class="">
          - The bridge between Telos, EOS and WAX is available&nbsp;
          <a :href="TSWAPS_BRIDGE" target="_blank"> here</a>.
        </q-item>
        <q-item dense class="">
          - Do you want to list your token? See our&nbsp;
          <a href="https://t-starter-app.gitbook.io/t-swaps/" target="_blank"
            >guide</a
          >.
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      TSWAPS_BRIDGE: process.env.TSWAPS_BRIDGE,
    };
  },
};
</script>

<style lang="scss" scoped>
.bridgeDash {
  width: 700px;
  max-width: 95vw;
}
.bridgeButton {
  color: white;
  background-color: rgb(85, 42, 248);
}

a {
  text-decoration: underline;
}
</style>
