<template>
  <q-page class="pageContainer medium">
    <div class="q-pa-sm">
      <div class="row justify-between q-my-md q-mx-md">
        <div class="text-h5">Liquidity</div>
      </div>

      <div class="row justify-center q-mt-xs">
        <div class="col-12">
          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row">
                <div class="col-sm-12">
                  <input1 />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <div class="cardCircle">
                  <i class="fas fa-plus"></i>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <input2 />
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <q-card
                    v-if="!showPoolExistsWarning"
                    flat
                    class="warning-card text-center q-mt-md"
                  >
                    No pool exists for the selected pair. The ratio of tokens
                    you add will set the price of this pool. A fee of
                    {{ this.$getQuantity(listingFee) }}
                    {{ $exAssToSymbol(listingFee) }} will be paid on creation.
                  </q-card>
                </div>
              </div>

              <q-card v-if="getHasPool" class="q-mt-md impact-card">
                <div class="q-ma-sm">Prices and pool share</div>
                <div>
                  <q-card
                    class="impact-card fit row wrap justify-evenly items-center content-center"
                  >
                    <div>
                      <div
                        class="q-ma-sm fit column wrap justify-center items-center content-center"
                      >
                        <div>
                          {{ pricePerToken(false) }}
                        </div>
                        <div>
                          {{ getPool.reserve1.symbol }} per
                          {{ getPool.reserve0.symbol }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        class="q-ma-sm fit column wrap justify-center items-center content-center"
                      >
                        <div>
                          {{ pricePerToken(true) }}
                        </div>
                        <div>
                          {{ getPool.reserve0.symbol }} per
                          {{ getPool.reserve1.symbol }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        class="q-ma-sm fit column wrap justify-center items-center content-center"
                      >
                        <div v-if="shareOfPool * 100 < 0.01">&lt;0.01%</div>
                        <div v-else>{{ (shareOfPool * 100).toFixed(2) }}%</div>
                        <div>Share of pool</div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </q-card>

              <div class="row q-mt-md">
                <div v-if="getHasPool" class="col-12">
                  <liquidity-button />
                </div>
                <div v-else class="col-12">
                  <create-button />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div
            class="row justify-between q-my-md q-mx-md"
            v-if="isAuthenticated"
          >
            <div class="text-h5">Your Liquidity</div>
          </div>

          <q-card flat class="swapCard" v-if="isAuthenticated">
            <q-card-section class="swapCardSection">
              <div class="row q-my-md">
                <div class="col-12">
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
import input1 from 'src/components/liquidity/Input1.vue';
import input2 from 'src/components/liquidity/Input2.vue';
import liquidityButton from 'src/components/liquidity/liquidityButton.vue';
import createButton from 'src/components/liquidity/createButton.vue';
import yourLiquidity from 'src/components/liquidity/yourLiquidity.vue';
import { DEFAULT_MSG } from 'src/constants/constants';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Index',
  components: {
    input1,
    input2,
    liquidityButton,
    yourLiquidity,
    createButton,
  },
  computed: {
    ...mapGetters('liquidity', [
      'getPool',
      'getHasPool',
      'getToken1',
      'getToken2',
      'getValue1',
      'getValue2',
    ]),
    ...mapGetters('account', ['isAuthenticated', 'accountName']),
    ...mapGetters('pools', ['getConfig']),

    listingFee() {
      if (this.getConfig?.listing_fee !== undefined) {
        return this.getConfig?.listing_fee;
      } else {
        return { quantity: 'error SWAP' };
      }
    },
    showPoolExistsWarning() {
      return (
        this.getHasPool ||
        this.getToken1.symbol == DEFAULT_MSG ||
        this.getToken2.symbol == DEFAULT_MSG
      );
    },

    shareOfPool() {
      if (this.getHasPool) {
        if (this.getPool.protocol === 'uniswap') {
          let currentShare = Math.sqrt(this.getValue1 * this.getValue2);
          let totalLP = this.$getQuantity(this.getPool.liquidity);
          return currentShare / (totalLP + currentShare);
        } else if (this.getPool.protocol === 'curve') {
          let currentShare = this.getValue1 + this.getValue2;
          let totalLP = this.$getQuantity(this.getPool.liquidity);
          return currentShare / (totalLP + currentShare);
        }
      } else {
        return 0;
      }
      return 0;
    },
  },
  methods: {
    ...mapActions('pools', [
      'updateConfig',
      'updatePools',
      'updateUserLiquidityPools',
    ]),
    ...mapActions('tokens', [
      'updateTokens',
      'updateAllTokensBalances',
      'updateTokenBalances',
    ]),
    ...mapActions('liquidity', [
      'updateActivePool',
      'updateSelectedTokenBalance',
    ]),

    pricePerToken(selector) {
      let token0 = this.getPool.reserve0;
      let token1 = this.getPool.reserve1;
      if (this.getHasPool) {
        let price0 = parseFloat(token0.quantity / token1.quantity).toFixed(
          token0.precision
        );
        let price1 = parseFloat(token1.quantity / token0.quantity).toFixed(
          token1.precision
        );
        if (selector) {
          return price0;
        } else {
          return price1;
        }
      } else {
        return '';
      }
    },
  },
  async mounted() {
    await this.updateConfig();
    this.updatePools();
    await this.updateAllTokensBalances(this.accountName);
    await this.updateTokens();
    await this.updateTokenBalances(this.accountName);
    this.updateActivePool();
    this.updateSelectedTokenBalance();
    this.updateUserLiquidityPools(this.accountName);
  },
};
</script>

<style lang="scss" scoped>
.q-card {
  &.impact-card {
    border: 1px solid $accent;
  }
}
</style>
