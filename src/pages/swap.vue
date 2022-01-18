<template>
  <q-page>
    <div class="q-pa-sm ">
      <div class="row justify-center q-mt-md">
        <div class="col-12 ">
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
                <span class="ml-2 fa-stack fa-1x cursor-pointer">
                  <i class="fas fa-circle fa-stack-2x swapCircle"></i>
                  <i
                    class="fas fa-arrow-down  fa-stack-1x fa-inverse swapArrow"
                  ></i>
                </span>
              </div>

              <div class="row ">
                <div class="col-sm-12 ">
                  <to-card />
                </div>
              </div>

              <div class="row q-mt-md">
                <div class="col-12 ">
                  <swap-button />
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
import fromCard from "src/components/swap/FromCard.vue";
import toCard from "src/components/swap/ToCard.vue";
import headButtons from "src/components/swap/Head.vue";
import swapButton from "src/components/swap/swapButton.vue";

export default {
  name: "swap",
  components: {
    fromCard,
    toCard,
    headButtons,
    swapButton
  }
};
</script>

<style lang="scss" scoped></style>
