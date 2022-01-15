<template>
  <div class="headButtons q-mx-md">
    <q-toolbar>
      <q-toolbar-title class="text-h5 text-weight-bold"> Swap </q-toolbar-title>
      <q-btn
        flat
        round
        :icon="'fas fa-cog'"
        size="0.75rem"
        @click="tolerance = true"
      >
      </q-btn>
      <q-dialog v-model="tolerance">
        <q-card style="min-width:350px; max-width:400px">
          <q-card-section class="text-grey-9" >
            <div class="text-h6" >Transaction Settings</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 text-grey-7">Slippage tolerance</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row justify-evenly">
              <div class="col-2">
                <q-btn flat class="float-right">0.1% </q-btn>
              </div>
              <div class="col-2">
                <q-btn flat class="float-right">0.5% </q-btn>
              </div>
              <div class="col-2">
                <q-btn flat class="float-right">1% </q-btn>
              </div>
              <div class="col-2">
                <q-input
                  placeholder="0.0"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  inputmode="decimal"
                  autocomplete="off"
                  autocorrect="off"
                  dense
                  type="number"
                  autofocus
                  @keyup.enter="prompt = false"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Accept" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-toolbar>

    <!-- <div class="row ">
      <div class="col-6 relative-position ">
        <div class="text-h5 text-weight-bold">Swap</div>
      </div>
      <div class="col-2 offset-1">
      
        <q-btn flat class="float-right"
          :icon="'fas fa-cog'"
          size="0.75rem"
          @click="tolerance = true">
        </q-btn>
      </div>
      <div class="col-2">
     
        <q-btn flat class="float-right"
          :icon="'fas fa-info-circle'">
          <q-tooltip anchor="bottom middle" self="bottom middle" :offset="[10, 40]">
          <strong>Tooltip</strong> on <em>top</em>
        </q-tooltip>
        </q-btn>
      </div>
      <q-dialog v-model="tolerance" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Settings</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1">Slippage tolerance</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row justify-evenly">
              <div class="col-2">
                <q-btn flat class="float-right">0.1%
                </q-btn>
              </div>
              <div class="col-2">
                <q-btn flat class="float-right">0.5%
                </q-btn>
                </div>
              <div class="col-2">
                <q-btn flat class="float-right">1%
                </q-btn>
                </div>
              <div class="col-2">
                <q-input 
                placeholder="0.0"
                pattern="^[0-9]*[.,]?[0-9]*$"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                dense 
                type="number" 
                autofocus 
                @keyup.enter="prompt = false" 
                />
              </div>
            </div>
            
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Accept" v-close-popup />
          </q-card-actions>
        </q-card>
    </q-dialog>
    </div> -->
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
    ...mapGetters("tokens", ["getTokens"]),
  },
};
</script>

<style lang="scss" scoped>
body.body--light {
  .headButtons {
    background: "transparent";
    color: $dark-0;
  }
}

body.body--dark {
  .headButtons {
    background: "transparent";
    color: $white;
  }
}
</style>
