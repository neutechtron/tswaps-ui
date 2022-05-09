<template>
  <div class="bridgeDash">
    <q-card class="bg-cyan-7">
      <div class="row justify-center">
        <div class="text-h6 text-center q-pr-sm">
            <div>
                Attention
            </div>
          <div class="text-p row justify-center" style="font-size: 15px">
            If you wish to bridge between Wax Telos and EOS, click the link below.
          </div>
          <div style="padding-bottom: 10px">
            <q-btn class="q-ml-sm bridgeButton" style="font-size: 15px">
              <a href="https://beta-bridge.tswaps.com"> Bridge <i role="presentation" class="fas fa-external-link-alt"/></a>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

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