<template>
  <q-layout view="LHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="toolbar">
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

    <div class="row justify-center">
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
  created() {
    this.$q.dark.set(true);
  }
};
</script>

<style lang="scss" scoped>
.pageContainer {
  flex: 0 1 800px;
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
