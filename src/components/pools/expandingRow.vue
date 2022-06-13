<template>
  <div class="row q-pa-sm">
    <div class="col-xs-12 col-sm-12 col-md-6">
      <div class="row">
        <div class="col-6 text-body1 text-left">
          Effective {{ pool.reserve0.symbol }} price:
        </div>

        <div class="col-6 text-body1 text-left">
          1 {{ pool.reserve0.symbol }} =
          {{
            parseFloat(pool.price0_last).toFixed(pool.reserve1.precision) +
            " " +
            pool.reserve1.symbol
          }}
        </div>
      </div>

      <div class="row">
        <div class="col-6 text-body1 text-left">
          Effective {{ pool.reserve1.symbol }} price:
        </div>

        <div class="col-6 text-body1 text-left">
          1 {{ pool.reserve1.symbol }} =
          {{
            parseFloat(pool.price1_last).toFixed(pool.reserve0.precision) +
            " " +
            pool.reserve0.symbol
          }}
        </div>
      </div>

      <div class="row">
        <div class="col-6 text-body1 text-left">
          Total Locked {{ pool.reserve0.symbol }}:
        </div>

        <div class="col-6 text-body1 text-left">
          {{
            parseFloat(pool.reserve0.quantity).toFixed(
              pool.reserve0.precision
            ) +
            " " +
            pool.reserve0.symbol
          }}
        </div>
      </div>

      <div class="row">
        <div class="col-6 text-body1 text-left">
          Total Locked {{ pool.reserve1.symbol }}:
        </div>

        <div class="col-6 text-body1 text-left">
          {{
            parseFloat(pool.reserve1.quantity).toFixed(
              pool.reserve1.precision
            ) +
            " " +
            pool.reserve1.symbol
          }}
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-6">
      <div class="row">
        <div class="col-12">
          <q-btn
            outline
            rounded
            color="primary"
            label="Swap"
            class="float-left"
          />
        </div>

        <div class="col-12 q-pt-sm">
          <q-btn
            outline
            rounded
            color="primary"
            label="Add Liquidity"
            class="float-left"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: ["pool"],
};
</script>

<style lang="scss" scoped></style>
