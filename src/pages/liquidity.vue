<template>
  <q-page>
    <div class="q-pa-sm">
      <div class="row justify-between q-my-md q-mx-md">
        <div class="text-h5 ">
          Liquidity
        </div>
      </div>

      <div class="row justify-center q-mt-xs">
        <div class="col-12">
          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row">
                <div class="col-sm-12 ">
                  <input1 />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <div class="cardCircle">
                  <i class="fas fa-plus "></i>
                </div>
              </div>

              <div class="row ">
                <div class="col-sm-12 ">
                  <input2 />
                </div>
              </div>

              <div class="row  q-mt-md">
                <div class="col-12 ">
                  <liquidity-button />
                </div>
              </div>

              <q-card
                v-if="!getHasPool"
                flat
                class="warning-card text-center q-mt-md"
              >
                No pool exists for the selected pair
              </q-card>
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
import input1 from "src/components/liquidity/Input1.vue";
import input2 from "src/components/liquidity/Input2.vue";
import liquidityButton from "src/components/liquidity/liquidityButton.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Index",
  components: {
    input1,
    input2,
    liquidityButton
  },
  computed: {
    ...mapGetters("liquidity", ["getPool", "getHasPool"])
  }
};
</script>

<style lang="scss" scoped></style>
