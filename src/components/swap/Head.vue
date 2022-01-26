<template>
  <div class="q-mx-md">
    <div>
      <q-btn
        flat
        round
        :icon="'fas fa-cog'"
        size="0.75rem"
        @click="tolerance = true"
      >
      </q-btn>
    </div>
    <q-dialog v-model="tolerance">
      <q-card style="min-width: 350px; max-width: 400px">
        <q-card-section class="text-grey-9">
          <div class="text-h6">Transaction Settings</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-grey-7">Slippage tolerance</div>
          <q-card-actions align="around">
            <q-btn outline rounded @click="setSlippage(0.1)">
              <div class="font-size: 1.5em">0.1%</div>
            </q-btn>
            <q-btn outline rounded @click="setSlippage(0.5)">0.5%</q-btn>
            <q-btn outline rounded @click="setSlippage(1)">1.0%</q-btn>
            <p>{{ putSlippage }}</p>
            <q-input
              class="col-3"
              input-style="font-size: 0.6em "
              dense
              rounded
              outlined
              mask="#.##%"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              v-model="slippage"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  components: {},

  data() {
    return {
      tolerance: false,
      address: "",
      price: 0,
      slippage: this.getSlippage,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("bridge", ["getToken"]),
    ...mapGetters("tokens", ["getTokens"]),
    ...mapGetters("swap", ["getSlippage"]),
    putSlippage: {
      get() {
        return this.slippage;
      },
      set(value) {
        this.slippage = value;
      },
    },
  },
  methods: {
    ...mapActions("swap", ["updateSlippage"]),
    setSlippage(value) {
      this.slippage = value;
    },
  },
  watch: {
    putSlippage() {
      console.log("Watcher called - with slippage ",this.slippage)
      // this.updateSlippage((this.slippage));

      // const that = this;
      // that.updateSlippage(parseFloat(that.slippage));
    },
  },
};
</script>

<style lang="scss" scoped>
.active {
  color: red;
}
// body.body--light {
//   .headButtons {
//     background: "transparent";
//     color: $dark-0;
//   }
// }

// body.body--dark {
//   .headButtons {
//     background: "transparent";
//     color: $white;
//   }
// }
</style>
