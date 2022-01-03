<template>
  <q-layout view="LHh Lpr lFf">
    <q-header class="transparent">
      <q-toolbar class="toolbar">
        <div class="q-py-sm">
          <router-link to="/" class="row items-center q-gutter-x-xs">
            <img alt="Telos EVM logo" src="~assets/images/SWAP.png" width="35" />
            <div class="text-h5 desktop-only">T-swaps</div>
          </router-link>
        </div>

         <q-btn
            flat 
            to="/"
            no-caps
          >
            Swap
          </q-btn>

          <q-btn 
            flat 
            to="/liquidity"
            no-caps
          >
            Liquidity
          </q-btn>

          <q-btn  
            flat
            to="/pools"
            no-caps
          >
            Pools
          </q-btn>

          <q-btn  
            flat
            to="/bridge"
            no-caps
          >
            Bridge
          </q-btn>
          <q-space/>

        <login-button></login-button>
        <q-btn
          @click="toggleDarkMode()"
          :icon="$q.dark.isActive ? 'fas fa-sun' : 'fas fa-moon'"
        ></q-btn>
      </q-toolbar>
    </q-header>

      <q-page-container class="flex flex-center ">
        <router-view />
      </q-page-container>

  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

export default {
  name: "MainLayout",
  components: { LoginButton },
  data() {
    return {};
  },
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle();
      localStorage.setItem("darkModeEnabled", this.$q.dark.isActive);
    }
  },
  created() {
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") !== "false");
  }
};
</script>

<style lang="scss" scoped>
.pageContainer {
  flex: 0 1 1200px;
  padding: 1rem;
}
</style>
