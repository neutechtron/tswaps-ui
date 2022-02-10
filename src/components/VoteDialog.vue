<template>
  <q-dialog class="" :value="!userHasVoted" seamless position="bottom">
    <q-card class="">
      <div class="fit column wrap content-center">
        <div>
          <div class="row justify-between items-center q-pt-sm">
            <div class="text-h6 q-pl-md">Like what you see?</div>
            <div class="q-pr-sm">
              <q-btn size="12px" flat dense round icon="clear" v-close-popup />
            </div>
          </div>
        </div>

        <div class="text-center">Want to help us improve?</div>
        <div class="text-center">Vote for us. It's free!</div>
        <div class="q-mt-xs q-mb-xs text-center">
          <q-btn
            size="md"
            no-caps
            class="sendBtn"
            label="Vote"
            @click="vote()"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { openURL } from "quasar";

export default {
  // name: 'ComponentName',
  data() {
    return {
      userHasVoted: true,
      userVoteInfo: [],
      bpList: ["bp.yknot", "southafrica1"],
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
  },
  methods: {
    async checkIfUserHasVoted() {
      const tableResults = await this.$store.$api.getTableRows({
        code: "eosio",
        scope: "eosio",
        table: "voters",
        lower_bound: this.accountName,
        upper_bound: this.accountName,
        limit: 1,
        reverse: false,
        show_payer: false,
      });
      this.userVoteInfo = tableResults.rows[0];
      let producers = this.userVoteInfo.producers;
      if (this.bpList.every((v) => producers.includes(v))) {
        this.userHasVoted = true;
      } else {
        this.userHasVoted = false;
      }
    },
    async vote() {
      let newBpList = [];
      // Check if current block producers are still valid
      // Check if limit has been reached, if not, append to list and vote
      if (this.userVoteInfo.producers.length >= 30) {
        this.$q.notify({
          color: "red-4",
          message: "You can only vote for 30 BP",
          timeout: 5000,
          actions: [
            {
              label: "Change on Explorer",
              color: "white",
              handler: () => {
                openURL(
                  `https://eosauthority.com/vote/producers?network=${
                    process.env.TESTNET == "true" ? "telostest" : "telos"
                  }`
                );
              },
            },
          ],
        });
        return;
      } else {
        newBpList = [
          ...new Set([...this.userVoteInfo.producers, ...this.bpList]),
        ].sort();
      }

      try {
        const actions = [
          {
            account: "eosio",
            name: "voteproducer",
            data: {
              producers: newBpList,
              proxy: "",
              voter: this.accountName,
            },
          },
        ];

        let transaction = await this.$store.$api.signTransaction(actions);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          message: "Thank you for supporting us!",
        });
      } catch (error) {
        this.$q.notify({
          color: "red-4",
          message: error,
          timeout: 5000,
          actions: [
            {
              label: "Change on Explorer",
              color: "white",
              handler: () => {
                openURL(
                  `https://eosauthority.com/vote/producers?network=${
                    process.env.TESTNET == "true" ? "telostest" : "telos"
                  }`
                );
              },
            },
          ],
        });
      }
      this.userHasVoted = true;
    },
  },

  async mounted() {
    // console.log('Component mounted.');
    // Check if user has voted for us
    await this.checkIfUserHasVoted();
  },
};
</script>
