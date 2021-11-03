<template>
  <q-layout view="LHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          T-Swaps Bridge
        </q-toolbar-title>

        <login-button></login-button>
        <q-btn
          @click="$q.dark.toggle()"
          :icon="$q.dark.isActive ? 'fas fa-moon' : 'fas fa-sun'"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
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
  }
};
</script>
