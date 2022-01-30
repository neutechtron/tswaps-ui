<template>
  <div>
    <q-btn
      v-if="!isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Connect Wallet"
      @click="showLogin = true"
    />
    <div v-for="pool in getUserPools" :key="pool.lpSymbol">
      <q-card class="liquidityCard q-mb-sm">
        <q-card-section>
          <div class="row">
            <div class="q-pt-sm">
              <token-avatar :token="pool.reserve0.symbol" :avatarSize="40" />

              <token-avatar
                :token="pool.reserve1.symbol"
                :avatarSize="40"
                class="avatarOverlap"
              />
              {{ pool.reserve0.symbol + "/" + pool.reserve1.symbol }}
            </div>
            <q-space />
            <div>
              <q-btn outline color="accent" @click="removePopup(pool)">
                <div class="text-body1">
                  Remove
                </div>
              </q-btn>
              <div>
                <q-badge outline color="primary">{{
                  pool.lpBalance + " " + pool.lpSymbol
                }}</q-badge>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-dialog v-model="remove">
      <q-card style="min-width: 350px; max-width: 400px">
        <q-card-section class="text-grey-9">
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
              <q-btn outline color="primary" @click="removeLiquidity()">
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
      error: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getUserPools"])
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updateUserLiquidityPools", "updatePools"]),
    ...mapActions("tokens", ["updateTokens", "updateTokenBalances"]),
    removePopup(pool) {
      this.removePool = pool;
      this.liquidity = pool.lpBalance;
      this.remove = true;
    },
    async removeLiquidity() {
      if (!this.accountName) {
        throw new Error(`Account does not exist`);
      }
      if (Number(this.liquidity) > Number(this.removePool.lpBalance)) {
        throw new Error(
          `Account ${this.accountName} does not have the required funds to preform swap`
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
              memo: ``
            }
          }
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }

      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
      await this.updatePools();
      await this.updateTokens();
      await this.updateTokenBalances(this.accountName);
      await this.updateUserLiquidityPools(this.accountName);
    }
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
    }
  }
};
</script>

<style lang="scss" scoped></style>
