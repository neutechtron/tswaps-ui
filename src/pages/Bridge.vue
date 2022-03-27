<template>
  <q-page>
  <section>
    <div class="row justify-center q-mt-xs q-mb-lg padding-xxl">
      <div class="col-7">
        <div class="text-h4 text-center">
          Effortlessly bridge your tokens between telos EVM and Native.
        </div>
      </div>
    </div>
    <div class="row justify-center q-mt-xs q-mb-lg">
      <bridge-stepper/>
    </div>

    <div class="row justify-center q-mt-lg q-mb-lg">
      <bridge-dashboard/>
    </div>
    
  </section>


  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import metamask from "src/components/Metamask";
import bridgeStepper from "../components/bridge/bridgeStepper.vue"
import bridgeDashboard from "src/components/bridge/TeleportDash.vue"


export default {
  components: {
    bridgeStepper,
    bridgeDashboard
  },
  mixins: [metamask],
  data() {
    return {
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
  }
}
</script>

<style lang="scss" scoped>
.q-card {
  &.not-authenticated {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 100px;
  }
  &.authenticated {
    display: grid;
    align-items: stretch;
    grid-template-columns: 50px auto 50px;
    padding-bottom: 40px;
    & div {
      margin: 0;
      @media only screen and (max-width: 585px) {
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }
  }
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 0 10px;
  font-size: 35px;
}

.text-h4 {
  color: white;
}
.padding-xxl{
  padding-bottom:40px;
  padding-top:70px;
}
</style>
