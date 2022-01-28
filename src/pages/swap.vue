<template>
  <q-page>
    <div class="q-pa-sm ">
      <div class="row justify-between q-my-md q-mx-md">
        <div class="text-h5  ">
          Swap
        </div>
        <head-buttons />
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
                <div class="cursor-pointer cardCircle" @click="swapToAndFrom()">
                  <i class="fas fa-arrow-down "></i>
                </div>
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
              <q-card
                v-if="!getIsValidPair"
                flat
                class="warning-card text-center q-mt-md"
              >
                No pool exists for the selected pair
              </q-card>
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
import { mapGetters, mapActions } from "vuex";

export default {
  name: "swap",
  components: {
    fromCard,
    toCard,
    headButtons,
    swapButton
  },
  computed: {
    ...mapGetters("swap", ["getIsValidPair"]),
    ...mapGetters("tokens", ["getTokens"])
  },
  methods: {
    ...mapActions("swap", ["swapToAndFrom"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tokens", ["updateTokens"]),
    findToken(tokenQuery) {
      // console.log("query:", tokenQuery);
      let res = null;
      if (tokenQuery) {
        const arr = tokenQuery.split("-");
        // console.log("arr:", arr);
        if (arr.length > 1) {
          const token_contract = arr[0];
          const token_sym = arr[1];
          res = this.getTokens.find(
            token =>
              token.symbol.toLowerCase().includes(token_sym.toLowerCase()) &&
              token.contract
                .toLowerCase()
                .includes(token_contract.toLowerCase())
          );
        }
      }
      return res;
    }
  },
  async mounted() {
    await this.updatePools();
    await this.updateTokens();
    const fromToken = this.findToken(this.$route.query.fromToken);
    // console.log(fromToken);
    if (fromToken) this.$store.commit("swap/setFromToken", fromToken);
    const toToken = this.findToken(this.$route.query.toToken);
    // console.log(toToken);
    if (toToken) this.$store.commit("swap/setToToken", toToken);
  }
};
</script>

<style lang="scss" scoped></style>
