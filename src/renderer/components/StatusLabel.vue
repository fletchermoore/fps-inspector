<template>
  <div class="text-sm-body-2">
    Status: <span>{{ status }}</span>
  </div>
</template>

<script lang="ts">
import { TaskState } from "../../common/constants";
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class StatusLabel extends Vue {
  status = "Idled";

  mounted() {
    console.log("neu", TaskState.Finished);
    // window.app.on('status-updated', (status: string) => {
    //     this.status = status;
    // });
  }
}
</script>

<style scoped></style>
