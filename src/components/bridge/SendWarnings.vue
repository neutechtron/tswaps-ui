<template>
  <div class="q-pt-md text-caption">
    <div class="text-center text-red-7" v-if="wrongNetwork && crossChain">
      <q-icon name="fas fa-exclamation-triangle" class="q-pr-xs" />Wrong network
      selected in Ethereum wallet.
    </div>
    <div class="text-center text-grey-7" v-if="crossChain">
      <q-icon name="fas fa-info-circle" class="q-pr-xs" /> Sending tokens across
      chains can take up to several minutes.
    </div>
    <div class="text-center text-grey-7" v-if="tokenNotFound">
      <q-icon name="fas fa-exclamation-triangle" class="q-pr-xs" />
      Token not found in wallet. Refresh or check your wallet balance.
    </div>
  </div>
</template>

<script>
export default {
  props: {
    crossChain: { type: Boolean, default: false },
    tokenNotFound: { type: Boolean, default: false },
    wrongNetwork: { type: Boolean, default: false }
  }
};
</script>
