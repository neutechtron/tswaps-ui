<template>
    <q-table
    :dense="$q.screen.lt.md"
      :data="rows"
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
        <q-tr :props="props">
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
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">This is expand slot for row above: {{ props.row.name }}.</div>
          </q-td>
        </q-tr>
      </template>

    </q-table>
</template>

<script>
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

const rows = [
  {
    name: 'TLOS-SWAP',
    liquidity: 159,
    volume24: 6.0,
    volume7d: 24,
    fees: 4.0,
    apy1week: 87,
    actions: '14%',
    iron: '1%'
  },
  {
    name: 'TLOS-START',
    liquidity: 237,
    volume24: 9.0,
    volume7d: 37,
    fees: 4.3,
    apy1week: 129,
    actions: '8%',
    iron: '1%'
  },
  {
    name: 'TLOS-SEEDS',
    liquidity: 262,
    volume24: 16.0,
    volume7d: 23,
    fees: 6.0,
    apy1week: 337,
    actions: '6%',
    iron: '7%'
  },
  {
    name: 'TLOS-HEART',
    liquidity: 305,
    volume24: 3.7,
    volume7d: 67,
    fees: 4.3,
    apy1week: 413,
    actions: '3%',
    iron: '8%'
  },
  {
    name: 'TLOS-SQRL',
    liquidity: 356,
    volume24: 16.0,
    volume7d: 49,
    fees: 3.9,
    apy1week: 327,
    actions: '7%',
    iron: '16%'
  },
  {
    name: 'TLOS-EOS',
    liquidity: 375,
    volume24: 0.0,
    volume7d: 94,
    fees: 0.0,
    apy1week: 50,
    actions: '0%',
    iron: '0%'
  },
  {
    name: 'TLOS-GEM',
    liquidity: 392,
    volume24: 0.2,
    volume7d: 98,
    fees: 0,
    apy1week: 38,
    actions: '0%',
    iron: '2%'
  },
  {
    name: 'TLOS-COOL',
    liquidity: 408,
    volume24: 3.2,
    volume7d: 87,
    fees: 6.5,
    apy1week: 562,
    actions: '0%',
    iron: '45%'
  },
  {
    name: 'TLOS-SAND',
    liquidity: 452,
    volume24: 25.0,
    volume7d: 51,
    fees: 4.9,
    apy1week: 326,
    actions: '2%',
    iron: '22%'
  },
  {
    name: 'TLOS-PETH',
    liquidity: 518,
    volume24: 26.0,
    volume7d: 65,
    fees: 7,
    apy1week: 54,
    actions: '12%',
    iron: '6%'
  }
]

export default {
  data () {
    return {
      columns,
      rows
    }
  }
}
</script>