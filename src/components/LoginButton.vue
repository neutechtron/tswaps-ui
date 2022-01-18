<template>
  <div>
    <div v-if="!isAuthenticated" class="">
      <q-btn
        v-if="!isAuthenticated"
        @click="showLogin = true"
        label="Login"
        no-caps
        flat
      />
    </div>
    <div v-if="isAuthenticated" class="q-px-sm row items-center">
      <q-btn
        no-caps
        outline
        padding="0.2rem"
        class="account-name q-px-sm"
        @click="copyAccountName()"
      >
        {{ accountName }}
      </q-btn>
    </div>
    <ual-dialog :showLogin.sync="showLogin" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { copyToClipboard } from "quasar";
import UalDialog from "src/components/UalDialog.vue";

export default {
  data() {
    return { showLogin: false, error: null };
  },
  components: { UalDialog },
  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading"
    ])
  },
  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    copyAccountName() {
      copyToClipboard(this.accountName).then(() => {
        this.$q.notify({
          color: "positive",
          message: "Copied address to clipboard"
        });
      });
    }
  },
  async mounted() {
    await this.autoLogin(this.$route.query.returnUrl);
  }
};
</script>

<style lang="scss" scoped>
// .account-name {
//   font-size: 1.2rem;
// }
// @media only screen and (max-width: 350px) {
//   .account-name {
//     font-size: 1rem;
//   }
// }
</style>
