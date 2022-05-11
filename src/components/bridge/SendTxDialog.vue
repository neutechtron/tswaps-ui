<template>
  <q-dialog
    :value="showTransaction"
    @input="$emit('update:showTransaction', $event)"
    confirm
    persistent
  >
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar
          icon="arrow_forward"
          color="primary"
          text-color="white"
          class="q-mr-sm"
        />
        <div class="text-h6 q-pa-sm">Transaction Sent</div>
      </q-card-section>
      <q-card-section>
        Transaction ID:
        <a
          :href="`${explorerUrl}${transaction}${
            !checkEVM() ? (getTestnet() ? '?network=telostest' : '?network=telos') : ''
          }`"
          target="_blank"
          style="word-wrap: break-word"
        >
          {{ transaction }}
        </a>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn class="hover-accent" label="Ok" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["transaction", "showTransaction", "Testnet"],
  computed: {
    ...mapGetters("blockchains", ["getCurrentChain"]),
    explorerUrl() {
      if (this.getFromChain.NETWORK_NAME == 'TELOS'){
        return process.env.NETWORK_EXPLORER;
      } else {
        return process.env.NETWORK_EVM_EXPLORER;
      };
    },
    ...mapGetters("bridge", [
      "getFromChain",
    ]),
  },
  methods: {
    getTestnet() {
      return process.env.TESTNET;
    },
    checkEVM() {
      if (this.getFromChain.NETWORK_NAME == 'TELOS') {
        return false;
      } else {
        return true;
      }
    }
  },
};
</script>
