<template>
  <q-dialog
    :value="showNetDialog"
    @input="$emit('update:showNetDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="row justify-between items-center">
        <q-item-label header>Select a network</q-item-label>
        <div class="q-pr-sm">
          <q-btn size="12px" flat dense round icon="clear" v-close-popup />
        </div>
      </div>
      <q-item>
        <q-input outlined round placeholder="Search network name" class="col" />
      </q-item>
      <q-separator />
      <q-item
        v-for="net in netOptions"
        :key="net"
        clickable
        v-close-popup
        @click="$emit('updateSelectedNet', net)"
      >
        <q-item-section avatar>
          <token-avatar :token="net" :avatarSize="30" />
        </q-item-section>
        <q-item-section>
          {{ net }}
        </q-item-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  props: ["showNetDialog", "netOptions", "selectedNet"]
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
}
</style>
