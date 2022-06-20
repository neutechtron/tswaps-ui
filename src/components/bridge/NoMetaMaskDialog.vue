<template>
  <q-dialog
    :value="showNoMeta"
    confirm
    persistent
  >
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Error</div>
      </q-card-section>
      <q-card-section>
        No MetaMask Detected
      </q-card-section>
      <q-card-actions align="center">
        <q-btn class="hover-accent" href="https://metamask.io/" target="_blank" label="Download" color="primary" v-close-popup/>
        <q-btn class="hover-accent" label="Cancel" color="primary" @click="$emit('changeShowNoMeta')" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
    props: ["showNoMeta"],
    data () {
        return {
            confirm: false,
        }
    },
}
</script>
