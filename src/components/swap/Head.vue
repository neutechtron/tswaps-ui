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
            <q-btn outline rounded>
              <div class="font-size: 1.5em ">
                0.1%
              </div>
            </q-btn>
            <q-btn outline rounded>0.5%</q-btn>
            <q-btn outline rounded>1.0%</q-btn>
            <q-input
              class="col-3"
              input-style="font-size: 0.6em "
              dense
              rounded
              outlined
              v-model="price"
              mask="#.##%"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
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
    return { tolerance: false, address: "" };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("bridge", ["getToken"]),
    ...mapGetters("tokens", ["getTokens"])
  }
};
</script>

<style lang="scss" scoped>
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
