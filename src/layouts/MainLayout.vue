<template>
  <q-layout view="LHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="toolbar">
        <q-toolbar-title>
          T-Swaps Bridge
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
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") === "true");
  }
};
</script>

<style lang="scss" scoped>
.pageContainer {
  flex: 0 1 800px;
  padding: 1rem;
}

body.body--light {
  .toolbar {
    background: $white;
    color: $dark-0;
  }
}

body.body--dark {
  .toolbar {
    background: $purpleSoft;
    color: $white;
  }
}
</style>
