<template>
  <q-table
    :dense="$q.screen.lt.md"
    :data="getPools"
    :columns="columns"
    row-key="id"
    flat
    virtual-scroll
    :rows-per-page-options="[0]"
    hide-bottom
    :pagination="{
      sortBy: 'liquidity',
      descending: true,
    }"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <!-- <q-th auto-width> Name </q-th>
        <q-th auto-width> Liquidity </q-th>
        <q-th auto-width> Volume 24h </q-th>
        <q-th auto-width> APR </q-th> -->
        <q-th
          auto-width
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
          {{ col.label }}
        </q-th>
        <!-- <q-th auto-width /> -->
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <token-avatar :token="props.row.reserve0.symbol" :avatarSize="40" />

          <token-avatar
            :token="props.row.reserve1.symbol"
            :avatarSize="40"
            class="avatarOverlap"
          />
        </q-td>

        <q-td auto-width>
          <q-btn flat @click="addLiquidity(props.row)">
            <div class="text-body1 text-bold">
              {{ props.row.reserve0.symbol + "/" + props.row.reserve1.symbol }}
            </div>
          </q-btn>
          <!-- <div>
            <q-badge outline color="primary">0.3% LP fees</q-badge>
          </div> -->
        </q-td>

        <q-td
          :props="props"
          v-for="col in props.cols.slice(1, 5)"
          :key="col.name"
        >
          {{ col.value }}
        </q-td>

        <!-- <q-td auto-width>
          <div class="text-body1">
            {{ props.row }}
          </div>
        </q-td>

        <q-td auto-width>
          <div class="text-body1">
            {{
              parseFloat(props.row.reserve0.quantity).toFixed(
                props.row.reserve0.precision
              )
            }}
          </div>
        </q-td>

        <q-td auto-width>
          <div class="text-body1">
            {{
              parseFloat(props.row.reserve1.quantity).toFixed(
                props.row.reserve1.precision
              )
            }}
          </div>
        </q-td> -->

        <!-- <q-td auto-width>
          <q-btn
            position="sticky"
            size="sm"
            color="primary"
            round
            dense
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'remove' : 'add'"
          />
        </q-td> -->
      </q-tr>

      <!-- <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <div class="text-left">
            <expanding-row :pool="props.row" />
          </div>
        </q-td>
      </q-tr> -->
    </template>
  </q-table>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import TokenAvatar from "src/components/TokenAvatar";
import ExpandingRow from "./expandingRow.vue";

const columns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "center",
    field: (row) => row.reserve0.symbol + "/" + row.reserve1.symbol,
    format: (val) => `${val}`,
  },
  //   { name: "price", label: "Price", field: (row) => row.virtual_price },
  {
    name: "liquidity",
    align: "center",
    label: "Liquidity",
    field: (row) =>
      Number.isNaN(row.reserve0.usdAmount + row.reserve1.usdAmount)
        ? -1
        : row.reserve0.usdAmount + row.reserve1.usdAmount,
    format: (val) => `$${val !== -1 ? val.toFixed(2) : "N/A"}`,
    sortable: true,
  },
  {
    name: "volume24",
    label: "Volume 24h",
    align: "center",
    field: (row) =>
      Number.isNaN(
        row?.volume_24h?.[0]?.usdAmount + row?.volume_24h?.[1]?.usdAmount
      )
        ? -1
        : row?.volume_24h?.[0]?.usdAmount + row?.volume_24h?.[1]?.usdAmount,
    format: (val) => `$${val !== -1 ? val.toFixed(2) : "N/A"}`,
    sortable: true,
  },
  //   {
  //     name: "volume7d",
  //     label: "Volume 2",
  //     field: (row) => row.volume1,
  //     sortable: true,
  //   },
  {
    name: "apr",
    label: "APR",
    field: (row) => (row?.APR?.total === undefined ? -1 : row?.APR?.total),
    format: (val) => `${val !== -1 ? (val * 100).toFixed(2) : "N/A"}%`,
    sortable: true,
    sortOrder: "ad",
  },
  //   {
  //     name: "actions",
  //     label: "Actions",
  //     align: "center",
  //     field: (row) => row.id,
  //     format: (val) => `<expanding-row :pool="pools[${val}]"></expanding-row>`,
  //   },
  //   { name: "actions", label: "Actions", field: "actions" },
];

export default {
  name: "Pools",
  components: {
    TokenAvatar,
  },
  methods: {
    ...mapActions("pools", ["updatePools", "updateConfig"]),
    ...mapActions("tokens", ["updateTokens", "updateUsdValue"]),
    printfunction(i) {
      console.log(i);
    },
    addLiquidity(pool) {
      let tokens = this.getTokens;
      let token1 = this.filterByToken(
        tokens,
        pool.reserve0.symbol,
        pool.reserve0.contract
      );
      let token2 = this.filterByToken(
        tokens,
        pool.reserve1.symbol,
        pool.reserve1.contract
      );
      if (token1) {
        this.$store.commit("liquidity/setToken1", token1);
      }
      if (token2) {
        this.$store.commit("liquidity/setToken2", token2);
      }
      this.$router.push({ path: "/liquidity" });
    },
    filterByToken(tokens, symbol, contract) {
      return tokens.find((token) => {
        return (
          token.symbol.toLowerCase().includes(symbol.toLowerCase()) &&
          token.contract.toLowerCase().includes(contract.toLowerCase())
        );
      });
    },
  },
  async mounted() {
    await this.updateConfig();
    await this.updateTokens();
    await this.updateUsdValue();
    await this.updatePools();
  },
  computed: {
    ...mapGetters("pools", ["getPools", "getUserPools"]),
    ...mapGetters("tokens", ["getTokens"]),
  },
  data() {
    return {
      columns,
      userLiquidity: true,
    };
  },
};
</script>
