<template>
  <q-layout view="LHh Lpr lFf">
    <q-header class="transparent">
      <q-toolbar class="toolbar">
        <div class="q-py-sm">
          <router-link to="/" class="row items-center q-gutter-x-xs">
            <img
              alt="Telos EVM logo"
              src="~assets/images/SWAP.png"
              width="35"
            />
            <div class="text-h5 desktop-only">T-swaps</div>
          </router-link>
        </div>

        <div v-if="$q.platform.is.desktop">
          <q-btn flat to="/" no-caps> Swap </q-btn>

          <q-btn flat to="/liquidity" no-caps> Liquidity </q-btn>

          <q-btn flat to="/pools" no-caps> Pools </q-btn>

          <q-btn
            flat
            @click="
              navigateExternalNewWindow('https://beta-bridge.tswaps.com/')
            "
            no-caps
          >
            Bridge
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
                  <q-icon
                    color="primary"
                    :name="darkMode.icon"
                    style="font-size: 1.4rem"
                  />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                @click="navigateExternalNewWindow('https://docs.uniswap.org/')"
              >
                <q-item-section> Docs </q-item-section>
                <q-icon
                  color="primary"
                  name="article"
                  style="font-size: 1.6rem"
                />
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

    <q-footer bordered class="transparent" v-if="$q.platform.is.mobile" reveal elevated>
      <q-tabs
        v-model="tab"
        align="justify"
        no-caps
        active-color="primary"
        indicator-color="transparent"
        :breakpoint="0"
      >
        <q-route-tab  class="text-purple"  name="swap" label="Swap" to="/" />
        <q-route-tab
          class="text-purple"

          name="liquidity"
          label="Liquidity"
          to="/liquidity"
        />
        <q-route-tab
         class="text-purple"
          name="pools"
          label="Pools"
          to="/pools"
        />
        <!-- TODO: Need to deleselect bridge tab to previous selected tab when clicked -->
        <q-route-tab 
         class="text-purple"        
          name="bridge"
          label="Bridge"
          to=""
          @click="navigateExternalNewWindow('https://docs.uniswap.org/')"
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="flex flex-center">
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
    return {
      darkMode: {
        text: "Dark Mode",
        icon: "fas fa-moon",
      },
      // isDekstop :  this.$q.platform.is.desktop ? true:false
    };
  },
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle();
      localStorage.setItem("darkModeEnabled", this.$q.dark.isActive);
      this.darkMode.text = this.$q.dark.isActive ? "Light Mode" : "Dark Mode";
      this.darkMode.icon = this.$q.dark.isActive ? "fas fa-sun" : "fas fa-moon";
    },
    // TODO : Better way of storing and navigating external links
    navigateExternalNewWindow: function (link) {
      window.open(link, "_blank");
    },
  },
  created() {
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") !== "false");
  },
};
</script>

<style lang="scss" scoped>
.pageContainer {
  flex: 0 1 1200px;
  padding: 1rem;
}
</style>
