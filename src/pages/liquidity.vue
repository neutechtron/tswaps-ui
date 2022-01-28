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

              <q-card
                v-if="!getHasPool"
                flat
                class="warning-card text-center q-mt-md"
              >
                No pool exists for the selected pair. The ratio of tokens you
                add will set the price of this pool.
              </q-card>

              <div class="row  q-mt-md">
                <div v-if="getHasPool" class="col-12 ">
                  <liquidity-button />
                </div>
                <div v-else class="col-12 ">
                  <create-button />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-between q-my-md q-mx-md">
            <div class="text-h5 ">
              Your Liquidity
            </div>
          </div>

          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row  q-my-md">
                <div class="col-12 ">
                  <your-liquidity />
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
import createButton from "src/components/liquidity/createButton.vue";
import yourLiquidity from "src/components/liquidity/yourLiquidity.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Index",
  components: {
    input1,
    input2,
    liquidityButton,
    yourLiquidity,
    createButton
  },
  computed: {
    ...mapGetters("liquidity", ["getPool", "getHasPool"]),
    ...mapGetters("account", ["accountName"])
  },
  methods: {},
  mounted() {}
};
</script>

<style lang="scss" scoped></style>
