<template>
  <div class="bridgeDash">
    <q-card class="swapCard" flat>
      <div class="row justify-center">
        <div class="text-h6 text-left q-pa-sm">
            <div>
                Attention
            </div>
          <div class="row justify-left text-body2 q-py-sm">
            If you wish to bridge between Telos, EOS and WAX, click the link below.
          </div>
          <div class="q-pb-sm">
            <q-btn :href="checkTestNet()" type="a" target="_blank" class="q-ml-sm bridgeButton text-body">
              EOSIO Bridge 
              <i role="presentation" class="fas fa-external-link-alt q-pl-sm"/>
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
        if (process.env.TESTNET === "true"){
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