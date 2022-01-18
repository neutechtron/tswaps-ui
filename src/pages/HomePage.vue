<template>
  <q-layout view="LHh Lpr lff" class="pageContainer">
    <div class="logo text-center cursor-pointer">
      <div
        @click="toggleDarkMode()"
        class="row items-center justify-center q-gutter-x-sm"
      >
        <img
          class="logo-icon"
          alt="Telos EVM logo"
          src="~assets/images/swap.png"
        />
        <div class="logo-text">T-Swaps</div>
      </div>
    </div>
    <div class="column flex-center q-mt-lg">
      <div class="slogan-text text-h5 text-center">
        The best wapping platform on Telos native.
      </div>
      <div class="q-mt-lg">
        <q-btn to="/swap" label="Enter Dapp" outline no-caps />
      </div>
    </div>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      darkMode: {
        text: "Dark Mode",
        icon: "fas fa-moon"
      }
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
    }
  },
  created() {
    this.$q.dark.set(localStorage.getItem("darkModeEnabled") !== "false");
  }
};
</script>

<style lang="scss" scoped>
.pageContainer {
  display: grid;
  place-content: center;
}
.logo {
  // margin-top: 5rem;
  .logo-icon {
    width: 4.8rem;
  }
  .logo-text {
    font-size: 3.2rem;
  }
}
.slogan-text {
  max-width: 300px;
}
</style>
