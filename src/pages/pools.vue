<template>
  <q-page class="pageContainer large">

      <div class="row q-my-md">
        <div class="col-12">
            <head-buttons />
        </div>
      </div>

      <div class="row justify-center q-mt-xs">
        <div class="col-12 tableCol">

          <q-card class="tableCard">
            <q-card-section class="swapCardSection">
              <pool-table/>
            </q-card-section>
          </q-card>

        </div>
      </div>

  </q-page>
</template>

<script>
import poolTable from "src/components/pools/PoolsTable.vue";
import headButtons from "src/components/pools/Head.vue"

export default {
  name: "pools",
  components: { 
    poolTable,
    headButtons
  },
  
};
</script>

<style lang="scss" scoped></style>
