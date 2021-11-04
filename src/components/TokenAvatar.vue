<template>
  <q-avatar :size="`${avatarSize}px`">
    <q-spinner-puff
      v-if="src === 'Loading'"
      :style="avatarStyle"
      color="primary"
    />
    <q-img v-else-if="src" :src="src" alt="Avatar" :style="avatarStyle">
      <template v-slot:error>
        <div class="transparent" style="padding: 0" v-html="identicon" />
      </template>
      <template v-slot:loading>
        <q-spinner-puff color="primary" :style="avatarStyle" />
      </template>
    </q-img>
    <div v-else v-html="identicon" />
  </q-avatar>
</template>

<script>
import { toSvg } from "jdenticon";
import { mapGetters } from "vuex";

export default {
  props: {
    token: {
      type: String,
      default: ""
    },
    avatarSize: {
      type: Number,
      default: 60
    },
    grayscale: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // TODO Use T-Starter pools.start for image urls
    // ...mapGetters("pools", ["getPoolTokens"]),
    identicon() {
      return toSvg(this.token, this.avatarSize);
    },
    avatarStyle() {
      return `width:${this.avatarSize}px; height:${this.avatarSize}px`;
    },
    src() {
      // prettier-ignore
      if (this.token === "" || this.token === undefined) return ""
      else if (this.token.includes("/")) return this.token; // If link provided
      // TODO Check link
      else { 
        // If no link provided
        const token = this.token.toUpperCase();
        if (this.grayscale) {
          switch (token) {
            case "TELOS": return "/tokens/tlos.svg";
            case "EOS"  : return "/tokens/eos.svg";
            case "WAX"  : return "/tokens/wax.svg";
            default: return ""
          }
        } else {
          switch (token) {
            case "PETH"  : return "/tokens/peth.png"
            case "PBTC"  : return "/tokens/pbtc.png";
            case "PUSDT" : return "https://raw.githubusercontent.com/T-Starter/T-Starter-images/master/icons/pUSDT.png";
            case "PUSDC" : return "https://raw.githubusercontent.com/T-Starter/T-Starter-images/master/icons/pUSDC.png";
            case "START" : return "/tokens/start.png";
            case "TLOS"  : return "/tokens/tlos.png";
            case "TELOS" : return "/tokens/tlos.png";
            case "EOS"   : return "/tokens/eos.png";
            case "WAX"   : return "/tokens/wax.png";
            case "BSC"   : return "/tokens/bnb.svg";
            case "TELOS EVM" : return "/tokens/tlos.png";
            case "BTC": case "BITCOIN" : return "/tokens/bitcoin.svg";
            case "ETH": case "ETHEREUM": case "ROPSTEN" : return "/tokens/eth.svg";
            default: 
              // Search for the avatar link on the pools.start/pooltokens table
              // Assumes the pools/setPoolTokens state action is called.
              if (this.chainSrc[token]) return this.chainSrc[token]
              else return ""
          }
        }
      }
    },
    chainSrc() {
      return [];
      //   if (this.getPoolTokens.length === 0) return [];
      //   else {
      //     let res = {};
      //     this.getPoolTokens.forEach(el => {
      //       const sym = this.$getSymFromAsset(el.token_info);
      //       res[sym] = el.avatar;
      //     });
      //     return res;
      //   }
    }
  }
};
</script>

<style lang="scss"></style>
