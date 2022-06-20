<template>
  <div class="bridgeDash">
    <q-card flat class="swapCard">
      <div class="row justify-center q-pt-lg">
        <div class="text-h6 text-center q-pr-sm ">Pending Transactions</div>
        <q-btn
          padding="sm"
          class="hover-accent"
          icon="fas fa-sync-alt"
          flat
          size="sm"
          @click="refreshTeleports()"
        /> 
        <!-- removing color="black" fixes isseues with dark/light mode -->
      </div>
      <div class="column" v-if="!getEvmAccountName || getEvmAccountName === ''">
        <div class="row justify-center items-center q-px-lg q-py-lg">
          Connect EVM Wallet
        </div>
      </div>
      <div class="column" v-else-if="unclaimedTeleports.length == 0">
        <div class="row justify-center items-center q-px-lg q-py-lg">
          No pending transactions
        </div>
      </div>
      <div class="column" v-else-if="unclaimedTeleports.length > 0">
        <div
          class="row justify-center items-center q-px-lg q-my-sm"
          v-for="t in unclaimedTeleports"
          :key="t.id"
        >
          <div class="col-md-3 col-xs-12 text-center text-bold q-py-sm">
            <token-avatar
              class="q-mx-sm"
              :token="$exAssToSymbol(t)"
              :avatarSize="30"
            />
            {{ t.quantity }}
          </div>
          <div class="col-md-6 col-xs-12 text-center text-bold q-py-sm">
            <token-avatar
              class="q-mx-sm"
              :token="getCurrentChain.NETWORK_NAME"
              :avatarSize="30"
            />
            <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
            <token-avatar
              class="q-mx-sm"
              :token="evmNetworkNameById(t.chain_id)"
              :avatarSize="30"
            />
            {{ t.displaydate }}
          </div>
          <div class="col-md-3 col-xs-12 text-center q-px-sm q-py-sm">
            <div
              side
              class="col-2 row wrap justify-center items-center content-center"
            >
              <q-btn
                class="hover-accent full-width"
                v-if="t.processing || claiming === t.id"
                color="grey"
              >
                Processing
              </q-btn>
              <q-btn
                class="hover-accent"
                v-else-if="
                  !t.claimed &&
                  correctNetwork(t.chain_id) &&
                  correctAccount(t.eth_address)
                "
                size="sm"
                color="positive"
                @click="claimEvm(t)"
              >
                Claim
              </q-btn>
              <q-btn
                class="hover-accent full-width"
                v-else-if="!t.claimed && !correctNetwork(t.chain_id)"
                color="primary"
                @click="switchMetamaskNetwork(networkNameFromId(t.chain_id))"
              >
                Switch Chain
              </q-btn>
              <q-btn
                class="hover-accent full-width"
                v-else-if="!t.claimed && !correctAccount(t.eth_address)"
                color="grey"
                @click="$q.notify({ color: 'green-4', message: 'TODO' })"
              >
                Switch Account
              </q-btn>
              <q-btn
                class="hover-accent"
                size="sm"
                color="negative"
                v-if="
                  Math.round(Date.now() / 1000) - t.time > 32 * 24 * 60 * 60
                "
                @click="tryCancelTP(t)"
              >
              Refund
                <q-tooltip>Cancel and refund teleport</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
      <q-card-actions class="row justify-center q-pb-md" v-if="claimedTeleports.length > 0">
        <div>{{ expanded ? "Hide" : "Show" }} Transaction History</div>
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <div class="text-subitle2">
            <div class="column">
              <div
                class="row justify-center items-center q-py-xs"
                v-for="t in claimedTeleports"
                :key="t.id"
              >
                <div class="col text-right">
                  {{ t.quantity }}
                </div>
                <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
                <div class="col row items-center justify-start">
                  <div>{{ ethAddressShort(t.eth_address) }}</div>
                  <token-avatar
                    class="q-mx-sm"
                    :token="evmNetworkNameById(t.chain_id)"
                    :avatarSize="25"
                  />
                </div>
                <!-- <div side>
                <div v-if="t.claimed" class="text-emphasis">Claimed</div>
              </div> -->
              </div>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { Serialize } from "eosjs";
import tokenAvatar from "src/components/TokenAvatar";
import metamask from "src/components/Metamask";

const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export default {
  components: {
    tokenAvatar,
  },
  mixins: [metamask],
  data() {
    return {
      expanded: false,
      pollTeleport: null,
      claiming: -1,
      remoteContractAddress: "",
      v1Teleports: [
        "0x39Ae6D231d831756079ec23589D2D37A739F2E89",
        "0xA4ba34334b6De2fe6C6F3c9d4b1765d92C96d859",
        "0xA4ba34334b6De2fe6C6F3c9d4b1765d92C96d859",
      ],
    };
  },
  computed: {
    ...mapGetters("account", ["accountName"]),
    ...mapGetters("blockchains", ["getCurrentChain"]),
    ...mapGetters("bridge", ["getToken"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTeleports",
    ]),
    unclaimedTeleports() {
      if (this.getEvmAccountName !== undefined) {
        return this.getTeleports.filter(
          (el) =>
            !el.claimed &&
            this.correctAccount(el.eth_address)
        );
      } else {
        return [];
      }
    },
    claimedTeleports() {
      if (this.getEvmAccountName !== undefined) {
        return this.getTeleports.filter(
          (el) =>
            el.claimed &&
            this.correctAccount(el.eth_address)
        );
      } else {
        return [];
      }
    },
  },
  methods: {
    ...mapActions("tport", ["updateTeleports"]),
    correctNetwork(remoteId) {
      if (this.getEvmNetwork) {
        return this.getEvmNetwork.remoteId === remoteId;
      } else return false;
    },
    correctAccount(account) {
      return (
        this.getEvmAccountName.toUpperCase() ===
        this.ethAddressFull(account).toUpperCase()
      );
    },
    networkNameFromId(remoteId) {
      const net = this.getEvmNetworkList.find((el) => el.remoteId === remoteId);
      return net ? net.name : "";
    },
    ethAddressShort(val) {
      return "0x" + val.substr(0, 4) + "..." + val.substr(36, 4);
    },
    ethAddressFull(val) {
      return "0x" + val.substr(0, 40);
    },
    evmNetworkNameById(remoteId) {
      const net = this.getEvmNetworkList.find((el) => el.remoteId === remoteId);
      if (net) return net.name;
      else return "";
    },
    async getSignData(teleportId, remoteContractAddress) {
      const res = await this.$store.$api.getTableRows({
        code: process.env.TPORT_ADDRESS,
        scope: process.env.TPORT_ADDRESS,
        table: "teleports",
        lower_bound: teleportId,
        upper_bound: teleportId,
        limit: 1,
      });

      if (!res.rows.length) {
        throw new Error(
          this.$t("dialog.could_not_find_teleport", { teleportId })
        );
      }

      const teleportData = res.rows[0];
      console.log("Teleport Data:", teleportData);

      // logteleport(uint64_t id, uint32_t timestamp, name from, asset quantity, uint8_t chain_id, checksum256 eth_address)
      const sb = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder(),
      });
      sb.pushNumberAsUint64(teleportData.id);
      sb.pushUint32(teleportData.time);
      sb.pushName(teleportData.account);
      sb.pushAsset(teleportData.quantity);
      sb.push(teleportData.chain_id);
      sb.pushArray(fromHexString(teleportData.eth_address));

      // Check if old teleport contract
      let data = "";
      if (
        this.v1Teleports.some(
          (addr) => addr.toLowerCase() == remoteContractAddress.toLowerCase()
        )
      ) {
        data = "0x" + toHexString(sb.array.slice(0, 69));
        console.log("Old Teleport Contract");
      } else {
        sb.pushArray(fromHexString(remoteContractAddress));
        sb.push(this.$chainToDecimals(teleportData.quantity));
        data = "0x" + toHexString(sb.array.slice(0, 91));
      }

      //   console.log("signData:", "0x" + toHexString(sb.array.slice(0, 91)));
      return {
        claimAccount: "0x" + teleportData.eth_address,
        data: data,
        signatures: teleportData.signatures,
      };
    },
    async claimEvm(teleport) {
      console.log(teleport);
      this.claiming = teleport.id;
      console.log("Claiming teleport:", teleport);
      const { injectedWeb3, web3 } = await this.$web3();

      if (injectedWeb3) {
        try {
          const token = this.getTPortTokensBySym(
            this.$chainToSym(teleport.quantity)
          );
          const remoteContractAddress = token.remote_contracts.find(
            (el) => el.key === this.getEvmRemoteId
          ).value;

          const signData = await this.getSignData(
            teleport.id,
            remoteContractAddress
          );
          console.log(JSON.stringify(signData));

          const remoteInstance = new web3.eth.Contract(
            this.$erc20Abi,
            remoteContractAddress
          ); // TODO Add check to validate abi
          // TODO Add try catch
          const resp = await remoteInstance.methods
            .claim(signData.data, signData.signatures)
            .send({ from: this.getEvmAccountName });
          // console.log(resp);

          await this.updateTeleports(this.accountName);
          this.claiming = -1;
          // TODO Do a proper refresh
        } catch (error) {
          this.claiming = -1;
          this.$errorNotification(error);
        }
      }
    },

    async tryCancelTP(teleport) {
      try {
        await this.cancelTP(teleport);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Refunded",
        });
        this.refreshTeleports();
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async cancelTP(teleport) {
      let transaction;
      const actions = [
        {
          account: process.env.TPORT_ADDRESS,
          name: "cancel",
          data: {
            id: teleport.id,
          },
        },
      ];
      transaction = await this.$store.$api.signTransaction(actions);
    },

    async refreshTeleports() {
      await this.updateTeleports(this.accountName);
    },
  },
  mounted() {
    // Poll teleports
    this.pollTeleport = setInterval(async () => {
      this.refreshTeleports();
    }, 10000);
  },
  destroyed() {
    clearInterval(this.pollTeleport);
  },
};
</script>

<style lang="scss" scoped>
.bridgeDash {
  width: 700px;
  max-width: 95vw;
  border-radius: 30px;
}
.bridgeButton {
  color: white;
  background-color: rgb(85, 42, 248);
}
</style>
