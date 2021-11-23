<template>
  <q-layout view="LHh Lpr lFf">
    <q-header class="transparent">
      <q-toolbar class="toolbar">
        <q-toolbar-title>
         <q-btn
            flat 
            to="/">
            T-Swaps
          </q-btn>

          <q-btn 
            flat 
            to="/liquidity">
            Liquidity
          </q-btn>

          <q-btn  
            flat
            to="/pools">
            Pools
          </q-btn>

        </q-toolbar-title>

        <login-button></login-button>
        <q-btn
          @click="toggleDarkMode()"
          :icon="$q.dark.isActive ? 'fas fa-sun' : 'fas fa-moon'"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <div class="row justify-center items-center">
      <q-page-container class="pageContainer">
        <router-view />
      </q-page-container>
    </div>
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
