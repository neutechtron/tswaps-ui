<template>
  <div>
    <q-btn
      v-if="!isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Login"
      @click="showLogin = true"
    />
    <div v-for="pool in getUserPools" :key="pool.lpSymbol">
      <q-card class="liquidityCard q-mb-sm">
        <q-card-section>
          <div class="fit row wrap items-center justify-center">
            <div class="col-shrink q-mb-sm">
              <token-avatar
                class="q-pt-sm"
                :token="pool.reserve0.symbol"
                :avatarSize="40"
              />

              <token-avatar
                :token="pool.reserve1.symbol"
                :avatarSize="40"
                class="avatarOverlap q-pt-sm"
              />

              <div class="column inline">
                <div>
                  {{ pool.reserve0.symbol + "/" + pool.reserve1.symbol }}
                </div>
                <div>
                  <q-badge outline color="accent">
                    {{ pool.lpBalance + " " + pool.lpSymbol }}
                  </q-badge>
                </div>
              </div>
            </div>

            <!-- <div>{{ pool.lpDeltaCost0 }} {{ pool.lpDeltaCost1 }}</div> -->
            <div class="col-shrink q-ml-md">
              <div class="q-mb-xs">
                Current Portion:
                <div class="fit row items-center content-end">
                  <div>
                    <q-badge outline color="accent">
                      {{ pool.lpCurrentCost0 }}
                    </q-badge>
                  </div>
                  <div class="q-ml-xs q-mr-xs">+</div>
                  <div>
                    <q-badge outline color="accent">
                      {{ pool.lpCurrentCost1 }}
                    </q-badge>
                  </div>
                </div>
              </div>
              <div class="q-mb-xs">
                Profit/Loss:
                <div class="fit row items-center content-end">
                  <div>
                    <q-badge outline color="accent">
                      {{
                        (
                          $assetToAmount(pool.lpCurrentCost0) -
                          $assetToAmount(pool.lpDeltaCost0)
                        ).toFixed($assetToPrecision(pool.lpCurrentCost0))
                      }}
                      {{ $assetToSymbol(pool.lpCurrentCost0) }}
                    </q-badge>
                  </div>
                  <div class="q-ml-xs q-mr-xs">+</div>
                  <div>
                    <q-badge outline color="accent">
                      {{
                        (
                          $assetToAmount(pool.lpCurrentCost1) -
                          $assetToAmount(pool.lpDeltaCost1)
                        ).toFixed($assetToPrecision(pool.lpCurrentCost1))
                      }}
                      {{ $assetToSymbol(pool.lpCurrentCost1) }}
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
            <!-- <q-space /> -->
            <div class="q-pt-xs q-ml-lg col-shrink">
              <q-btn
                outline
                color="accent"
                @click="removePopup(pool)"
                size="15px"
              >
                <div class="text-body">Remove</div>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-dialog v-model="remove">
      <q-card style="min-width: 350px; max-width: 400px">
        <q-card-section class="">
          <div class="row">
            <div class="text-h6">
              {{
                removePool
                  ? removePool.reserve0.symbol +
                    "/" +
                    removePool.reserve1.symbol
                  : "Remove liquidity"
              }}
            </div>

            <q-space />
            <q-btn
              outline
              color="accent"
              @click="liquidity = removePool.lpBalance"
            >
              <div class="font-size: 1.5em">max</div>
            </q-btn>
          </div>
          <div class="text-body1">
            {{
              removePool ? removePool.lpBalance + " " + removePool.lpSymbol : ""
            }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row">
            <div>
              <q-input outlined v-model="liquidity" dense />
            </div>
            <q-space />
            <div>
              <q-btn outline color="primary" @click="tryRemoveLiquidity()">
                <div class="font-size: 1.5em">Remove</div>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <ual-dialog :showLogin.sync="showLogin" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UalDialog from "src/components/UalDialog.vue";
import TokenAvatar from "src/components/TokenAvatar";
import { openURL } from "quasar";

export default {
  name: "Index",
  components: { UalDialog, TokenAvatar },
  data() {
    return {
      showTransaction: false,
      transaction: null,
      fromNetwork: "TELOS",
      pollTokens: null,
      showLogin: false,
      remove: false,
      liquidity: 0.0,
      removePool: null,
      error: null,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getUserPools"]),
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updateUserLiquidityPools", "updatePools"]),
    ...mapActions("tokens", [
      "updateTokens",
      "updateTokenBalances",
      "updateAllTokensBalances",
    ]),
    ...mapActions("liquidity", [
      "updateActivePool",
      "updateSelectedTokenBalance",
    ]),
    removePopup(pool) {
      this.removePool = pool;
      this.liquidity = pool.lpBalance;
      this.remove = true;
    },

    async tryRemoveLiquidity() {
      try {
        // await this.createMemo();
        await this.removeLiquidity();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: `Liquidity removed. ${this.transaction.slice(0, 8)}...`,
          timeout: 7000,
          actions: [
            {
              label: "View on Explorer",
              color: "white",
              handler: () => {
                openURL(
                  `https://eosauthority.com/transaction/${
                    this.transaction
                  }?network=${
                    process.env.TESTNET == "true" ? "telostest" : "telos"
                  }`
                );
              },
            },
          ],
        });
        await this.updatePools();
        await this.updateAllTokensBalances(this.accountName);
        await this.updateTokens();
        this.updateTokenBalances(this.accountName);
        this.updateActivePool();
        this.updateSelectedTokenBalance();
        this.updateUserLiquidityPools(this.accountName);
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async removeLiquidity() {
      if (!this.accountName) {
        throw new Error(`Account does not exist`);
      }
      if (Number(this.liquidity) > Number(this.removePool.lpBalance)) {
        throw new Error(
          `Account ${this.accountName} does not have the required funds to remove liquidity`
        );
      }

      let transaction;
      if (true) {
        const actions = [
          {
            account: this.removePool?.lpContract, // token contract
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: process.env.SWAP_CONTRACT,
              quantity: `${parseFloat(this.liquidity).toFixed(
                this.removePool?.lpPrecision
              )} ${this.removePool?.lpSymbol}`,
              memo: ``,
            },
          },
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }

      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
    },
  },
  async mounted() {
    await this.updatePools();
    await this.updateUserLiquidityPools(this.accountName);
  },
  watch: {
    async accountName() {
      if (this.isAuthenticated) {
        await this.updateUserLiquidityPools(this.accountName);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
