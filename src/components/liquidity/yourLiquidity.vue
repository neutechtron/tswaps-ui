<template>
  <div>
    {{ getUserPools }}
    <q-btn
      v-if="!isAuthenticated"
      no-caps
      class="sendBtn full-width"
      label="Connect Wallet"
      @click="showLogin = true"
    />
    <ual-dialog :showLogin.sync="showLogin" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UalDialog from "src/components/UalDialog.vue";

export default {
  name: "Index",
  components: { UalDialog },
  data() {
    return {
      showTransaction: false,
      transaction: null,
      fromNetwork: "TELOS",
      pollTokens: null,
      showLogin: false,
      error: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getUserPools"])
  },
  methods: {
    ...mapActions("account", ["accountExistsOnChain", "login"]),
    ...mapActions("pools", ["updateUserLiquidityPools"])
  },
  async mounted() {
    await this.updateUserLiquidityPools(this.accountName);
  },
  watch: {
    async accountName() {
      if (this.isAuthenticated) {
        await this.updateUserLiquidityPools(this.accountName);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
