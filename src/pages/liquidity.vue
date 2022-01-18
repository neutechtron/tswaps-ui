<template>
  <q-page>
    <div class="q-pa-sm">
      <div class="row justify-center q-my-md">
        <div class="col-12">
          <head-buttons />
        </div>
      </div>

      <div class="row justify-center q-mt-xs">
        <div class="col-12">
          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row">
                <div class="col-sm-12 ">
                  <from-card />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <div class="cardCircle">
                  <i class="fas fa-plus "></i>
                </div>
              </div>

              <div class="row ">
                <div class="col-sm-12 ">
                  <to-card />
                </div>
              </div>

              <div class="row  q-mt-md">
                <div class="col-12 ">
                  <liquidity-button />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row q-mx-md q-mt-xl q-mb-md">
            <div class="col-6 relative-position ">
              <div class="text-h5 text-weight-bold">Your Liquidity</div>
            </div>
          </div>

          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row  q-my-md">
                <div class="col-12 ">
                  <liquidity-button />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import fromCard from "src/components/liquidity/Input1.vue";
import toCard from "src/components/liquidity/Input2.vue";
import headButtons from "src/components/liquidity/Head.vue";
import liquidityButton from "src/components/liquidity/liquidityButton.vue";

export default {
  name: "Index",
  components: {
    fromCard,
    toCard,
    headButtons,
    liquidityButton
  }
};
</script>

<style lang="scss" scoped></style>
