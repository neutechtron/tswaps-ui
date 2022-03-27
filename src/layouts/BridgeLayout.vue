<template>
  <q-layout view="LHh Lpr lff">
    <q-header class="main-header">
      <q-toolbar class="toolbarBridge">
        <div class="q-pa-sm">
          <router-link to="/" class="row items-center q-gutter-x-sm">
            <img
              alt="Telos EVM logo"
              src="~assets/images/swap.png"
              width="35"
            />
            <div class="t-swaps-title text-h5">Telos EVM Bridge</div>
          </router-link>
        </div>
        <q-space />
      </q-toolbar>
    </q-header>
    <section >
      <div class="row">
        <div class="col-12">
          <div class="gradient-box"/>
        </div>
      </div>
    </section>

    <q-page-container class="column items-center">
      <router-view />
    </q-page-container>

    
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

export default {
  name: "MainLayout",
  data() {
    return {
      darkMode: {
        text: "Dark Mode",
        icon: "fas fa-moon"
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
          link: "https://t.me/tswaps"
        },
        {
          name: "medium",
          icon: "fab fa-medium-m",
          link: "https://tswaps.medium.com/"
        },
        // {
        //   name: "twitter",
        //   icon: "fab fa-twitter",
        //   link: "https://twitter.com/tswaps_com",
        // },
        {
          name: "github",
          icon: "fab fa-github",
          link: "https://github.com/Telos-Swaps"
        }
        // { name: "docs", icon: "fa fa-book", link: "https://docs.tstarter.io/" },
      ]
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated"])
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
    }
  },
  created() {
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") ||"false");
  },

  async mounted() {}
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
  &:hover {
    color: $accent;
  }
}

.toolbarBridge {
  background: #071A5F;
  color: $plainWhite;
}

.gradient-box { 
  min-height: 390px;
  width: 100%;
  background: $gradient-2;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -100;
}
</style>
