<template>
  <div class="bridgeDash">
    <q-card class="swapCard">
      <div class="row justify-center">
        <div class="text-h6 text-center q-pr-sm">
            <div>
                Attention
            </div>
          <div class="text-p row justify-center" style="font-size: 15px">
            If you wish to bridge between Wax Telos and EOS, click the link below.
          </div>
          <div style="padding-bottom: 10px">
            <q-btn :href="checkTestNet()" class="q-ml-sm bridgeButton" style="font-size: 15px">
              Bridge <i role="presentation" class="fas fa-external-link-alt"/>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
  export default {
    methods: {
      checkTestNet(){
        if (process.env.TESTNET === "truee"){
          return process.env.TSWAPS_BRIDGE_TEST;
        } else{
          return process.env.TSWAPS_BRIDGE;
        }
      }
    }
  }
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