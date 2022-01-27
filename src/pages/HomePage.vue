<template>
  <q-layout view="LHh Lpr lff" class="home-page">
    <div class="title-page-container column items-center justify-center">
      <!-- <div class="logo">
        <img
          class="logo-icon"
          alt="Telos EVM logo"
          src="~assets/home/home-swap-icon-glow.png"
        />
      </div> -->
      <div class="logo-img "></div>
      <div class="logo-text q-mb-md">T-Swaps</div>
      <div class="text-h2 q-mb-xs">Fast, Affortable Token Swaps</div>
      <div class="text-h3 q-mb-lg">
        An innovative trading platform on Telos native
      </div>
      <div class="row q-gutter-md full-width  items-center justify-center">
        <q-btn to="/swap" no-caps class=" sendBtn " label="Launch App" />
        <q-btn to="#" no-caps class="outlineBtn " label="Learn More" outline />
      </div>
    </div>
    <benefits-page />
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import benefitsPage from "src/components/home/BenefitsPage.vue";

export default {
  components: { benefitsPage },
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
.slogan-text {
  max-width: 300px;
}

.sendBtn,
.outlineBtn {
  flex-basis: 200px;
  height: 4rem;
}

.title-page-container {
  padding: 0.8rem;
  background: url("~assets/home/home-swap-bg.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  // width: 100%;
  min-height: 100vh;
  // display: grid;
  // place-content: center;
  // justify-items: center;
  // grid-template-rows: 1fr 1fr;

  // .logo {
  //   position: relative;
  //   // display: grid;
  //   // place-content: center;
  //   height: 10rem;
  //   clip: inherit;
  //   .logo-icon {
  //     // width: clamp(15rem, 50%, 50rem);
  //     width: 40rem;
  //     position: absolute;
  //     // clip: rect(100%, 100%, 100%, 100%);
  //     clip: inherit;
  //     left: -20rem;
  //     // top: clamp(-10rem, -10vw, 1rem);
  //     top: -12rem;
  //     z-index: 0;

  //   }
  //   // margin-top: 5rem;
  // }
  // .logo {
  //   position: relative;
  //   height: 10rem;
  //   width: 100%;
  //   clip: inherit;
  //   .logo-img {
  //     // width: clamp(15rem, 50%, 50rem);
  //     // width: 40rem;
  //     position: absolute;
  //     // clip: rect(100%, 100%, 100%, 100%);
  //     // clip: inherit;
  //     left: -20rem;
  //     // top: clamp(-10rem, -10vw, 1rem);
  //     top: -12rem;
  //     z-index: 0;

  //     background: url("~assets/home/home-swap-icon-glow.png");
  //     // background-repeat: no-repeat;
  //     background-size: 40rem;
  //     // background-position: center;
  //     // min-height: 5rem;
  //     // min-width: 5rem;
  //     // background-image: url("~assets/home/home-swap-icon-glow.png");
  //     background-repeat: no-repeat;
  //     // background-attachment: fixed;
  //     background-position: center;
  //     width: 100%;
  //     height: 75px;
  //     text-align: center;
  //     overflow: hidden;
  //   }
  //   // margin-top: 5rem;
  // }

  .logo-img {
    z-index: 0;
    background: url("~assets/home/home-swap-icon-glow.png");
    background-size: 40rem;
    background-repeat: no-repeat;
    background-position: center;
    margin-top: -15rem;
    margin-bottom: -16rem;
    width: 100%;
    height: 40rem;
    text-align: center;
    overflow: hidden;
  }

  .logo-text {
    font-size: 4rem; // Min
    // font-size: 8rem;
    font-family: "silkathin";
    z-index: 1;
  }
}
</style>
