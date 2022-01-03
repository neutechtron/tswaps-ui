<template>
    <q-table
      :dense="$q.screen.lt.md"
      :data="allPools"
      :columns="columns"
      row-key="name"
      flat
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
        </q-tr>
      </template>

      <template v-slot:body="props">

        <q-tr :props="props" >
          <q-td auto-width>
            <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" >
          <q-td colspan="100%">
            <div 
              v-if="props.row.userLiquidity"
              class="text-left"
            >
              This is expand slot for row above: {{ props.row.name }}.
            </div>
          </q-td>
        </q-tr>
      </template>

    </q-table>
</template>

<script>
import { mapGetters, mapActions } from "vuex"

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'liquidity', align: 'center', label: 'Liquidity', field: 'liquidity', sortable: true },
  { name: 'volume24', label: 'Volume (24hrs)', field: 'volume24', sortable: true },
  { name: 'volume7d', label: 'Volume (7d)', field: 'volume7d', sortable: true },
  { name: 'fees', label: 'Fees (24hrs)', field: 'fees' },
  { name: 'apy1week', label: 'APY (1 week)', field: 'apy1week' },
  { name: 'actions', label: 'Actions', field: 'actions' }
]

export default {
  name: "Pools",
  methods: {
    ...mapActions("pools", ['updatePools', 'updateUserLiquidityPools'])
  },
  computed: mapGetters("pools", ['allPools', 'userPools']),
  data () {
    return {
      columns,
      userLiquidity:true
    }
  }
}
</script>