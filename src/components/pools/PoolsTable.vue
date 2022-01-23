<template>
    <q-table
      :dense="$q.screen.lt.md"
      :data="getPools"
      :columns="columns"
      row-key="id"
      flat
      hide-header
    >

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width />
        </q-tr>
      </template>

      <template v-slot:body="props">

        <q-tr :props="props" >
          <q-td auto-width>
            <token-avatar
                :token="props.row.token0_symbol" 
                :avatarSize="40"
              />

              <token-avatar
                :token="props.row.token0_symbol" 
                :avatarSize="40"
                class="avatarOverlap"
              />
            
          </q-td>

          <q-td auto-width>
            <div class="text-body1 text-bold " >
              {{props.row.token0_symbol + "/" + props.row.token1_symbol}}
            </div>
            <div>
              <q-badge outline color="primary">0.3% LP fees</q-badge>
            </div>
            
          </q-td>

          <q-td auto-width>
            <div class="text-body2 text-weight-light" >
              Price
            </div>
            <div class="text-body1 text-bold" >
              {{parseFloat(props.row.virtual_price).toFixed(Math.max(props.row.reserve0.precision,props.row.reserve1.precision))}}
            </div>
            
          </q-td>

          <q-td auto-width>
            <div class="text-weight-thin" >
              Total locked {{props.row.reserve0.symbol}}
            </div>
            <div class="text-body1 text-bold" >
              {{parseFloat(props.row.reserve0.quantity).toFixed(props.row.reserve0.precision)}}
               
            </div>
          </q-td>

          <q-td auto-width>
            <div class="text-weight-thin" >
              Total locked {{props.row.reserve1.symbol}}
            </div>
            <div class="text-body1 text-bold" >
              {{parseFloat(props.row.reserve1.quantity).toFixed(props.row.reserve1.precision)}}
            </div>
          </q-td>
            
          <q-td auto-width>
            <q-btn position= "sticky" size="sm" color="primary" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" >
          <q-td colspan="100%">
            <div 
              class="text-left"
            >
              <expanding-row :pool ="props.row" />
            </div>
          </q-td>
        </q-tr>
      </template>

    </q-table>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TokenAvatar from "src/components/TokenAvatar";
import ExpandingRow from "./expandingRow.vue"

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.token0_symbol + "/" + row.token1_symbol,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'price', label: 'Price', field: row => row.virtual_price },
  { name: 'liquidity', align: 'center', label: 'Liquidity', field: row => row.liquidity.quantity, sortable: true },
  { name: 'volume24', label: 'Volume 1', field: row => row.volume0, sortable: true },
  { name: 'volume7d', label: 'Volume 2', field: row => row.volume1, sortable: true },
  { name: 'apy1week', label: 'APY (1 week)', field: 'apy1week' },
  { name: 'actions', label: 'Actions', field: 'actions' }
]

export default {
  name: "Pools",
  components:{
    TokenAvatar,
    ExpandingRow
  },
  methods: {
    ...mapActions("pools", ['updatePools']),
    ...mapActions("tokens", ["updateTokens"]),
    printfunction(i){
      console.log(i)
    }
  },
  async mounted() {
    await this.updatePools();
    await this.updateTokens();
  },
  computed: mapGetters("pools", ['getPools', 'userPools']),
  data () {
    return {
      columns,
      userLiquidity:true
    }
  }
}
</script>