<template>
  <q-page >
    <div class="q-pa-md">

      <div class="row justify-center q-mt-md">
        <div class="col-xs-12 col-sm-9 col-md-6">
          <head-buttons />
        </div>
      </div>
    
      <div class="row justify-center q-mt-xs">
        <div class="col-xs-12 col-sm-9 col-md-6">

          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
        
              <div class="row">
                <div class="col-sm-12 ">
                  <from-card />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <span class="ml-2 fa-stack fa-1x">
                  <i class="fas fa-square fa-stack-2x swapSquare"></i>
                  <i class="fas fa-arrow-down  fa-stack-1x fa-inverse swapArrow" ></i>
                </span>
              </div>

              <div class="row ">
                <div class="col-sm-12 ">
                  <to-card />
                </div>
              </div>

              <div class="row  q-mt-md">
                <div class="col-12 ">
                  <swap-button/>
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
import fromCard from "src/components/swaps/FromCard.vue";
import toCard from "src/components/swaps/ToCard.vue";
import headButtons from "src/components/swaps/Head.vue"
import swapButton from "src/components/swaps/swapButton.vue"

export default {
  name: "swap",
  components: { 
    fromCard, 
    toCard, 
    headButtons,
    swapButton
  },
  
};
</script>

<style lang="scss" scoped></style>
