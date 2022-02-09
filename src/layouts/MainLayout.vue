<template>
  <q-layout view="LHh Lpr lff">
    <q-header class="main-header">
      <q-toolbar class="testnet-banner" v-if="TESTNET">
        Running on Telos testnet
      </q-toolbar>
      <q-toolbar class="toolbar">
        <div class="q-pa-sm">
          <router-link to="/" class="row items-center q-gutter-x-sm">
            <img
              alt="Telos EVM logo"
              src="~assets/images/swap.png"
              width="35"
            />
            <div class="t-swaps-title text-h5">T-Swaps</div>
            <q-badge label="V3 Beta" class="q-my-sm" />
          </router-link>
        </div>

        <div class="gt-sm q-ql-xs">
          <q-btn flat to="/swap" no-caps :class="isSelectedTab('swap')">
            Swap
          </q-btn>

          <q-btn
            flat
            to="/liquidity"
            no-caps
            :class="isSelectedTab('liquidity')"
          >
            Liquidity
          </q-btn>

          <q-btn flat to="/pools" no-caps :class="isSelectedTab('pools')">
            Pools
          </q-btn>

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

        <login-button />

        <!-- About, Help Center, Dark Theme, Docs, Legal & Privacy -->
        <q-btn icon="menu" flat>
          <q-menu :offset="[0, 15]">
            <q-list style="min-width: 180px" class="menu">
              <q-item clickable :class="`lt-md ${isSelectedTab('swap')}`">
                <q-item-section>
                  <router-link to="/swap">Swap</router-link>
                </q-item-section>
              </q-item>
              <q-item clickable :class="`lt-md ${isSelectedTab('liquidity')}`">
                <q-item-section>
                  <router-link to="/liquidity">Liquidity</router-link>
                </q-item-section>
              </q-item>
              <q-item clickable :class="`lt-md ${isSelectedTab('pools')}`">
                <q-item-section>
                  <router-link to="/pools">Pools</router-link>
                </q-item-section>
              </q-item>
              <q-item clickable @click="openUrl(TSWAPS_BRIDGE)" class="lt-md">
                <q-item-section>
                  <div class="row items-center">
                    Bridge
                    <q-icon
                      name="fas fa-external-link-alt"
                      size="0.8rem"
                      class="q-pl-xs"
                    />
                  </div>
                </q-item-section>
              </q-item>
              <q-separator class="lt-md" />

              <!-- <q-item clickable @click="openUrl(TSWAPS_DOCS)">
                <q-item-section> Docs </q-item-section>
                <q-item-section side>
                  <q-icon name="article" />
                </q-item-section>
              </q-item> -->
              <q-item clickable @click="toggleDarkMode()">
                <q-item-section> Theme </q-item-section>
                <q-item-section side>
                  <q-icon :name="darkMode.icon" />
                </q-item-section>
              </q-item>
              <q-separator v-if="isAuthenticated" />
              <q-item v-if="isAuthenticated" clickable @click="logout">
                <q-item-section> Logout </q-item-section>
                <q-item-section side>
                  <q-icon name="fas fa-sign-out-alt" />
                </q-item-section>
              </q-item>
              <!-- <q-item clickable>
                <q-item-section> Help Center </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section> About </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section> Legal &amp; Privacy </q-item-section>
              </q-item> -->
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

    <!-- <q-footer bordered class="toolbar-mobile lt-md" reveal>
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
    </q-footer> -->

    <q-page-container class="column items-center">
      <router-view />
    </q-page-container>

    <q-footer class="footer q-pt-md">
      <div class="column items-center justify-center q-pb-md q-gutter-y-xs">
        <div>
          c 2022 T-Swaps • Version {{ SITE_VERSION }}
          <!-- <q-tooltip
            anchor="top left"
            :offset="[0, 5]"
            self="bottom left"
            class="row"
          >
            Interface Version
          </q-tooltip> -->
        </div>
        <div class="row justify-start">
          <a
            v-for="site in socialLinks"
            :key="site.name"
            :href="site.link"
            class="social-link q-ma-sm"
            target="_blank"
          >
            <q-icon size="24px" :name="site.icon" />
          </a>
        </div>
        <div>
          Made with ♥ by
          <a
            :href="KNOT_HOME"
            style="text-decoration: underline"
            target="_blank"
            >Yknot BCS</a
          >
          <!-- <q-tooltip
            anchor="top left"
            :offset="[0, 5]"
            self="bottom left"
            class="row"
          >
            Interface Version
          </q-tooltip> -->
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

export default {
  name: "MainLayout",
  components: { LoginButton },
  data() {
    return {
      darkMode: {
        text: "Dark Mode",
        icon: "fas fa-moon",
      },
      TSWAPS_BRIDGE: process.env.TSWAPS_BRIDGE,
      TSWAPS_DOCS: process.env.TSWAPS_DOCS,
      SITE_VERSION: process.env.SITE_VERSION,
      TESTNET: process.env.TESTNET?.toLowerCase() === "true",
      KNOT_HOME: process.env.KNOT_HOME,
      tab: "",
      socialLinks: [
        // { name: "web", icon: "fas fa-globe", link: "https://tstarter.io/" },
        {
          name: "telegram",
          icon: "fab fa-telegram-plane",
          link: "https://t.me/tswaps",
        },
        {
          name: "medium",
          icon: "fab fa-medium-m",
          link: "https://tswaps.medium.com/",
        },
        // {
        //   name: "twitter",
        //   icon: "fab fa-twitter",
        //   link: "https://twitter.com/tswaps_com",
        // },
        {
          name: "github",
          icon: "fab fa-github",
          link: "https://github.com/Telos-Swaps",
        },
        // { name: "docs", icon: "fa fa-book", link: "https://docs.tstarter.io/" },
      ],
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated"]),
  },
  methods: {
    ...mapActions("account", ["logout"]),
    toggleDarkMode() {
      this.$q.dark.toggle();
      localStorage.setItem("darkModeEnabled", this.$q.dark.isActive);
      this.darkMode.text = this.$q.dark.isActive ? "Light Mode" : "Dark Mode";
      this.darkMode.icon = this.$q.dark.isActive ? "fas fa-sun" : "fas fa-moon";
    },
    openUrl(url) {
      window.open(url, "_blank");
    },
    isSelectedTab(tab) {
      return this.$route.name == tab ? "selectedTab" : "";
    },
  },
  created() {
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") !== "false");
  },

  async mounted() {},
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 380px) {
  .t-swaps-title {
    display: none;
  }
}

.selectedTab {
  font-weight: 700;
}

.testnet-banner {
  background: $primary;
  min-height: 1.2rem;
  justify-content: center;
}

.social-link {
  //   padding: 5px 20px 10px 0;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  color: $secondary;
  &:hover {
    color: $accent;
  }
}
</style>
