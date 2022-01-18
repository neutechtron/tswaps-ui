<template>
  <q-layout view="LHh Lpr lFf">
    <q-header class="main-header">
      <q-toolbar class="toolbar">
        <div class="q-pa-sm">
          <router-link to="/" class="row items-center q-gutter-x-xs">
            <img
              alt="Telos EVM logo"
              src="~assets/images/swap.png"
              width="35"
            />
            <div class="text-h5 desktop-only">T-Swaps</div>
          </router-link>
        </div>

        <div class="desktop-only q-ql-xs">
          <q-btn flat to="/" no-caps> Swap </q-btn>

          <q-btn flat to="/liquidity" no-caps> Liquidity </q-btn>

          <q-btn flat to="/pools" no-caps> Pools </q-btn>

          <q-btn flat type="a" :href="TSWAPS_BRIDGE" target="_blank" no-caps>
            Bridge
            <q-icon
              name="fas fa-external-link-alt"
              size="0.8rem"
              class="q-pl-xs"
            />
          </q-btn>
        </div>

        <q-space />

        <login-button></login-button>

        <!-- About, Help Center, Dark Theme, Docs, Legal & Privacy -->
        <q-btn icon="reorder">
          <q-menu :offset="[0, 10]">
            <q-list style="min-width: 180px">
              <q-item clickable>
                <q-item-section> About </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section> Help Center </q-item-section>
              </q-item>
              <q-item clickable @click="toggleDarkMode()">
                <q-item-section>{{ darkMode.text }} </q-item-section>
                <q-item-section avatar>
                  <q-icon :name="darkMode.icon" style="font-size: 1.4rem" />
                </q-item-section>
              </q-item>
              <q-item clickable @click="openUrl(TSWAPS_DOCS)">
                <q-item-section> Docs </q-item-section>
                <q-icon name="article" style="font-size: 1.6rem" />
              </q-item>
              <q-item clickable>
                <q-item-section> Legal &amp; Privacy </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- Old Dark Mode button for ref -->
        <!-- <q-btn
          @click="toggleDarkMode()"
          :icon="$q.dark.isActive ? 'fas fa-sun' : 'fas fa-moon'"
        ></q-btn> -->
      </q-toolbar>
    </q-header>

    <q-footer
      bordered
      class="toolbar-mobile"
      v-if="$q.platform.is.mobile"
      reveal
    >
      <q-tabs
        v-model="tab"
        align="justify"
        no-caps
        indicator-color="transparent"
        :breakpoint="0"
      >
        <q-route-tab name="swap" label="Swap" to="/" />
        <q-route-tab name="liquidity" label="Liquidity" to="/liquidity" />
        <q-route-tab name="pools" label="Pools" to="/pools" />
        <!-- TODO: Need to deleselect bridge tab to previous selected tab when clicked -->
        <q-route-tab name="bridge" to="" @click="openUrl(TSWAPS_BRIDGE)">
          <div class="row items-center">
            Bridge
            <q-icon
              name="fas fa-external-link-alt"
              size="0.8rem"
              class="q-pl-xs"
            />
          </div>
        </q-route-tab>
      </q-tabs>
    </q-footer>

    <q-page-container class="column items-center">
      <router-view />
      <p class="text-center">Version: {{ SITE_VERSION }}<br /></p>
    </q-page-container>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

export default {
  name: "MainLayout",
  components: { LoginButton },
  data() {
    return {
      darkMode: {
        text: "Dark Mode",
        icon: "fas fa-moon"
      },
      TSWAPS_BRIDGE: process.env.TSWAPS_BRIDGE,
      TSWAPS_DOCS: process.env.TSWAPS_DOCS,
      SITE_VERSION: process.env.SITE_VERSION
    };
  },
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle();
      localStorage.setItem("darkModeEnabled", this.$q.dark.isActive);
      this.darkMode.text = this.$q.dark.isActive ? "Light Mode" : "Dark Mode";
      this.darkMode.icon = this.$q.dark.isActive ? "fas fa-sun" : "fas fa-moon";
    },
    openUrl(url) {
      window.open(url, "_blank");
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
