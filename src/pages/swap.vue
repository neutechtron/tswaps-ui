<template>
  <q-page class="pageContainer medium">
    <div class="q-pa-sm">
      <div class="row justify-between q-my-md q-mx-md">
        <div class="text-h5">Swap</div>
        <head-buttons />
      </div>

      <div class="row justify-center q-mt-xs">
        <div class="col-12">
          <q-card flat class="swapCard">
            <q-card-section class="swapCardSection">
              <div class="row">
                <div class="col-sm-12">
                  <from-card />
                </div>
              </div>

              <div class="row justify-center q-mt-xs q-mb-xs">
                <div class="cursor-pointer cardCircle" @click="swapToAndFrom()">
                  <i class="fas fa-arrow-down"></i>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <to-card />
                </div>
              </div>

              <div class="row q-mt-md">
                <div class="fit row justify-between q-ml-md q-mr-md">
                  <div>Slippage Tolerance:</div>
                  <div>{{ getSlippage * 100 }}%</div>
                </div>

                <div
                  v-if="getCanSwap"
                  class="fit row justify-between q-ml-md q-mr-md q-mt-md"
                >
                  <div>Price:</div>
                  <div>
                    <div class="fit row wrap items-center content-center">
                      {{ pricePerToken
                      }}<q-btn
                        round
                        class="q-ml-xs"
                        color="black"
                        icon="fas fa-sync-alt"
                        size="0.5em"
                        @click="swapPrice = !swapPrice"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row q-mt-md">
                <div class="col-12">
                  <swap-button />
                </div>
              </div>
              <q-card
                v-if="!showPoolExistsWarning"
                flat
                class="warning-card text-center q-mt-md"
              >
                No pool exists for the selected pair
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Additional swap info card -->
      <div v-if="getCanSwap && getAmount > 0" class="q-mt-md">
        <q-card flat class="q-pa-xs swapCard">
          <div class="q-ma-md">
            <div class="fit row justify-between q-pb-xs">
              <div>
                <div class="fit row wrap items-center content-center">
                  Minimum received
                  <q-icon class="q-ml-xs" name="far fa-question-circle">
                    <q-tooltip anchor="top middle" self="center middle">
                      Your transaction will revert if there is a large,
                      unfavorable price movement before it is confirmed.
                    </q-tooltip></q-icon
                  >
                </div>
              </div>
              <div>{{ minimumReceived }} {{ getToToken.symbol }}</div>
            </div>
            <div class="fit row justify-between q-pb-xs">
              <div>
                <div class="fit row wrap items-center content-center">
                  Price Impact
                  <q-icon class="q-ml-xs" name="far fa-question-circle">
                    <q-tooltip anchor="top middle" self="center middle">
                      The difference between the market price and estimated
                      price due to trade size.
                    </q-tooltip></q-icon
                  >
                </div>
              </div>
              <div v-if="priceImpact * 100 < 0.01">&lt;0.01%</div>
              <div v-else>{{ (priceImpact * 100).toFixed(2) }}%</div>
            </div>
            <div class="fit row justify-between">
              <div>
                <div class="fit row wrap items-center content-center">
                  Swapping Fee
                  <q-icon class="q-ml-xs" name="far fa-question-circle">
                    <q-tooltip anchor="top middle" self="center middle">
                      For each trade a
                      {{
                        getPool.trade_fee / 100 + getConfig.protocol_fee / 100
                      }}% fee is paid
                      <div>
                        - {{ getPool.trade_fee / 100 }}% to LP token holders
                      </div>
                      <div>
                        - {{ getConfig.protocol_fee / 100 }}% as platform and
                        rewards fee
                      </div>
                    </q-tooltip></q-icon
                  >
                </div>
              </div>
              <div>
                {{ (getAmount * swappingFee).toFixed(getFromToken.precision) }}
                {{ getFromToken.symbol }}
              </div>
            </div>
            <!-- TODO Routes -->
            <!-- <div class="fit row justify-between q-pb-xs">
              <div>
                <div class="fit row wrap items-center content-center">
                  Route
                  <q-icon class="q-ml-xs" name="far fa-question-circle">
                    <q-tooltip anchor="top middle" self="center middle">
                      Routing through these tokens resulted in the best price for your trade.
                    </q-tooltip></q-icon
                  >
                </div>
              </div>
              <div>{{ minimumReceived }}</div>
            </div> -->
          </div>
        </q-card>
      </div>
      <stockGraph v-if="showGraph"></stockGraph>
    </div>
    <vote-dialog />
  </q-page>
</template>

<script>
import fromCard from 'src/components/swap/FromCard.vue';
import toCard from 'src/components/swap/ToCard.vue';
import headButtons from 'src/components/swap/Head.vue';
import swapButton from 'src/components/swap/swapButton.vue';
import voteDialog from 'src/components/VoteDialog.vue';
import stockGraph from 'src/components/swap/stockGraph.vue';
import { mapGetters, mapActions } from 'vuex';
import { DEFAULT_MSG } from 'src/constants/constants';

export default {
  name: 'swap',
  components: {
    fromCard,
    toCard,
    headButtons,
    swapButton,
    voteDialog,
    stockGraph,
  },
  data() {
    return {
      swapPrice: false,
    };
  },
  computed: {
    ...mapGetters('account', ['isAuthenticated', 'accountName']),
    ...mapGetters('swap', [
      'getIsValidPair',
      'getToToken',
      'getFromToken',
      'getSlippage',
      'getPool',
      'getCanSwap',
      'getAmount',
      'getToEstimate',
    ]),
    ...mapGetters('tokens', ['getTokens']),
    ...mapGetters('pools', ['getConfig']),

    showPoolExistsWarning() {
      return (
        this.getIsValidPair ||
        this.getToToken.symbol == DEFAULT_MSG ||
        this.getFromToken.symbol == DEFAULT_MSG
      );
    },

    showGraph() {
      return (
        (this.getToToken.symbol !== DEFAULT_MSG ||
          this.getFromToken.symbol !== DEFAULT_MSG) &&
        this.getIsValidPair
      );
    },

    pricePerToken() {
      let token0 = this.getPool.reserve0;
      let token1 = this.getPool.reserve1;
      if (this.getCanSwap) {
        let price0 = parseFloat(token0.quantity / token1.quantity).toFixed(
          token0.precision
        );
        let price1 = parseFloat(token1.quantity / token0.quantity).toFixed(
          token1.precision
        );
        if (this.swapPrice) {
          return `${price0} ${token0.symbol} per ${token1.symbol}`;
        } else {
          return `${price1} ${token1.symbol} per ${token0.symbol}`;
        }
      } else {
        return '';
      }
    },

    swappingFee() {
      if (this.getCanSwap) {
        let feePercentage =
          (this.getPool.trade_fee + this.getConfig.protocol_fee) / 10000;
        let fee = parseFloat(feePercentage);
        return fee;
      } else {
        return 0;
      }
    },

    minimumReceived() {
      if (this.getCanSwap) {
        let minimum = Number(this.getToEstimate) * (1 - this.getSlippage);
        return this.$truncate(minimum, this.getToToken.precision);
      } else {
        return 0;
      }
    },

    priceImpact() {
      // https://ethereum.stackexchange.com/questions/102063/understand-price-impact-and-liquidity-in-pancakeswap
      if (this.getCanSwap) {
        let amountInWithFee = this.getAmount * (1 - this.swappingFee);
        let price_impact =
          amountInWithFee / (this.getFromReserves + amountInWithFee);
        return price_impact;
      } else {
        return 0;
      }
    },

    getFromReserves() {
      if (this.getCanSwap) {
        if (this.getFromToken.symbol === this.getPool.reserve0.symbol) {
          return parseFloat(this.getPool.reserve0.quantity);
        } else {
          return parseFloat(this.getPool.reserve1.quantity);
        }
      }
      return 0;
    },
  },
  methods: {
    ...mapActions('swap', [
      'swapToAndFrom',
      'createMemo',
      'updateSwapPool',
      'updateToAndFromBalance',
    ]),
    ...mapActions('pools', ['updatePools', 'updateConfig']),
    ...mapActions('tokens', [
      'updateTokens',
      'updateTokenBalances',
      'updateAllTokensBalances',
    ]),

    findToken(tokenQuery) {
      // console.log("query:", tokenQuery);
      let res = null;
      if (tokenQuery) {
        const arr = tokenQuery.split('-');
        // console.log("arr:", arr);
        if (arr.length > 1) {
          const token_contract = arr[0];
          const token_sym = arr[1];
          res = this.getTokens.find(
            (token) =>
              token.symbol.toLowerCase().includes(token_sym.toLowerCase()) &&
              token.contract
                .toLowerCase()
                .includes(token_contract.toLowerCase())
          );
        }
      }
      return res;
    },
  },
  async mounted() {
    await this.updateTokens();
    await this.updatePools();
    await this.updateAllTokensBalances(this.accountName);
    await this.updateTokens();
    this.updateTokenBalances(this.accountName);
    this.updateSwapPool();
    this.updateToAndFromBalance();
    const fromToken = this.findToken(this.$route.query.fromToken);
    if (fromToken) this.$store.commit('swap/setFromToken', fromToken);
    const toToken = this.findToken(this.$route.query.toToken);
    if (toToken) this.$store.commit('swap/setToToken', toToken);
    await this.updateConfig();
  },
};
</script>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
