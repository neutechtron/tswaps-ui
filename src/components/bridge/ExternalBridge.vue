<template>
  <div class="bridgeDash">
    <q-card class="swapCard column items-center q-pa-md" flat>
      <div class="text-h6 q-mb-sm">Attention</div>
      <div class="text-body2 q-mb-sm text-center">
        If you wish to bridge between Telos, EOS and WAX, click the link below.
      </div>
      <div class="">
        <q-btn
          :href="checkTestNet()"
          type="a"
          target="_blank"
          class="q-ml-sm bridgeButton text-body"
        >
          EOSIO Bridge
          <i role="presentation" class="fas fa-external-link-alt q-pl-sm" />
        </q-btn>
      </div>
    </q-card>
  </div>
</template>

<script>
export default {
  methods: {
    checkTestNet() {
      if (process.env.TESTNET === "true") {
        return process.env.TSWAPS_BRIDGE_TEST;
      } else {
        return process.env.TSWAPS_BRIDGE;
      }
    },
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
</style>
