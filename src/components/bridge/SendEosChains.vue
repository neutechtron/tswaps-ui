<template>
  <q-form @submit="trySend" ref="sendForm" class="q-gutter-y-lg">
    <div class="column items-center">
      <!-- <div class="networks row justify-center q-pb-sm">
        <div class="text-weight-light text-subtitle2  col-12 text-center">
          {{ currentChain.NETWORK_NAME }} Balance
        </div>
        <div>{{ balance }} {{ selectedTokenSym }}</div>
      </div> -->
      <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
        <!-- TO -->
        <q-input
          outlined
          autocapitalize="off"
          bottom-slots
          v-model="to"
          label="To"
          counter
          maxlength="12"
          :rules="[accountExistsOnChain]"
          error-message="Account does not exist"
          lazy-rules
          debounce="1000"
          no-error-icon
        >
          <template v-slot:append>
            <net-selector
              :selectedNetwork="selectedNetwork"
              :networkOptions="networkOptions"
              @changeNetwork="$emit('update:selectedNetwork', $event)"
            />
          </template>
        </q-input>
        <!-- Amount -->
        <amount-input
          :selectedTokenSym="selectedTokenSym"
          :selectedToken="selectedToken"
          :amount.sync="amount"
          :balance="balance"
        />
        <!-- Memo -->
        <q-input
          outlined
          bottom-slots
          v-model="memo"
          label="Memo"
          counter
          maxlength="200"
        />
      </div>
      <!-- Send -->
      <div class="text-center self-stretch q-pt-sm q-gutter-x-sm">
        <q-btn
          class="hover-accent"
          size="lg"
          color="primary"
          dense
          no-shadow
          label="Send"
          style="width: 40%"
          type="submit"
          :disabled="selectedToken === undefined"
        />
      </div>

      <send-warnings
        :crossChain="
          selectedNetwork.toUpperCase() !==
          getCurrentChain.NETWORK_NAME.toUpperCase()
        "
        :tokenNotFound="selectedToken === undefined"
      />

      <send-tx-dialog
        :transaction="transaction"
        :showTransaction.sync="showTransaction"
      />
    </div>
  </q-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
import amountInput from "src/components/bridge/AmountInput";
import sendTxDialog from "src/components/bridge/SendTxDialog";
import sendWarnings from "src/components/bridge/SendWarnings";

import { Api, JsonRpc, Serialize } from "eosjs";

export default {
  components: { netSelector, amountInput, sendTxDialog, sendWarnings },
  props: ["selectedTokenSym", "selectedNetwork", "networkOptions"],
  data() {
    return {
      to: null,
      amount: null,
      memo: "",
      showTransaction: false,
      transaction: null,
      // explorerUrl: process.env.NETWORK_EXPLORER,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", [
      "getCurrentChain",
      "getNetworkByName",
      "getBridgeTokens",
    ]),
    explorerUrl() {
      return this.getCurrentChain.NETWORK_EXPLORER;
    },

    //TODO get this info from chain?
    selectedToken() {
      return this.wallet.find((a) => a.token_sym === this.selectedTokenSym);
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    avatar() {
      return this.selectedToken ? this.selectedToken.avatar : "";
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },
  },
  methods: {
    ...mapActions("account", ["setWalletBalances"]),
    async accountExistsOnChain(account) {
      // get current selected chain
      let blockchains = this.getNetworkByName(
        this.selectedNetwork.toUpperCase()
      );
      let newChain = {};

      // check if testnet or not
      if (process.env.TESTNET == "true") {
        newChain = blockchains.find((el) => el.TEST_NETWORK === true);
      } else {
        newChain = blockchains.find((el) => el.TEST_NETWORK === false);
      }
      // console.log(newChain)

      //set rpc
      const rpc = new JsonRpc(
        `${newChain.NETWORK_PROTOCOL}://${newChain.NETWORK_HOST}:${newChain.NETWORK_PORT}`
      );
      //check if account exists on chain
      let exists = await rpc.get_account(account);
      return exists;
    },

    async trySend() {
      try {
        await this.send();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Sent",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async send() {
      if (!(await this.accountExistsOnChain(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`,
        });
        return;
      }

      // if same network, do normal transaction
      let transaction;
      if (
        this.selectedNetwork.toUpperCase() === this.getCurrentChain.NETWORK_NAME
      ) {
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: this.to,
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_decimals
              )} ${this.selectedTokenSym}`,
              memo: this.memo,
            },
          },
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      } else {
        // If different EOS network, send to bridge
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "bridge.start",
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_decimals
              )} ${this.selectedTokenSym}`,
              memo: `${this.to}@${this.selectedNetwork.toLowerCase()}|${
                this.memo
              }`,
            },
          },
        ];
        transaction = await this.$store.$api.signTransaction(actions);
      }
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.to = null;
        this.amount = null;
        this.memo = "";
        this.$refs.sendForm.reset();
        this.$refs.sendForm.resetValidation();
        this.setWalletBalances(this.accountName);
      }
    },
  },
};
</script>
