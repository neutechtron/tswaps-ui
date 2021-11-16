<template>
  <q-layout view="Lhh Lpr lFf">
    <q-header class="transparent">
      <q-toolbar class="toolbar">
        <div class="col">
          <q-toolbar-title class="gt-xs">
            T-Swaps Bridge
          </q-toolbar-title>
        </div>

        <login-button />
        <q-btn
          @click="toggleDarkMode()"
          :icon="$q.dark.isActive ? 'fas fa-sun' : 'fas fa-moon'"
        />
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
  padding: 1rem;
}

body.body--light {
  .toolbar {
    color: $dark-0;
  }
}

body.body--dark {
  .toolbar {
    color: $white;
  }
}
.q-btn {
  background: $white;
  color: $dark-0;
}
</style>
