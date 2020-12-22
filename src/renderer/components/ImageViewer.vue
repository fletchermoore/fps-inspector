<template>
  <div id="image-viewer">
    <img :src="imagePath" />
    <div v-show="imagePath == ''">No image loaded.</div>
    <div v-show="inProgress || isCanceled">
      <v-progress-linear
        color="light-blue"
        height="10"
        :value="progressPercent"
        striped
      ></v-progress-linear>
      {{ progressCount }} / {{ total }} <span v-show="isCanceled">[ Stopped ]</span>
    </div>
    <div v-show="isFinished">
      <v-progress-linear
        color="light-blue"
        height="10"
        value="100"
      ></v-progress-linear>
      Finished: {{ total }} images processed.
      </div>
    <div>
    <span v-show="!inProgress">
      <v-btn color="primary" @click="startProcessing" class="mr-3">
        {{ processBtnLabel() }}
      </v-btn>
    </span>
    <span v-show="inProgress">
      <v-btn color="secondary" @click="cancel" >Cancel</v-btn
      >
    </span>
    <span v-show="isFinished">
      <v-btn color="primary">Continue</v-btn></span>
    </div>

  </div>
</template>

<script lang="ts">
import { Task } from "electron";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Message, TaskState } from "../../common/constants";

@Component
export default class ImageViewer extends Vue {
  imagePath = "";
  inProgress = false;
  isCanceled = false;
  isFinished = false;
  progressCount = 0;
  progressPercent = 0;
  total = 0;

  mounted() {
    window.app.on("image-set", (path: string) => {
      this.imagePath = path;
    });

    window.app.on(Message.ProcessStatusUpdated, (status: TaskState) => {
      if (status == TaskState.Running) {
        this.inProgress = true;
      } else if (status == TaskState.Canceled) {
        this.isCanceled = true;
        this.inProgress = false;
      } else if (status == TaskState.Finished) {
        this.isFinished = true;
        this.inProgress = false;
      }
    });

    window.app.on(Message.ProcessProgressUpdated, (status: ProgressState) => {
      this.progressCount = status.progressCount;
      this.total = status.totalCount;
      this.progressPercent = (this.progressCount / this.total) * 100;
    });
  }

  startProcessing() {
    this.isCanceled = false;
    this.isFinished = false;
    window.app.startProcessing();
  }

  cancel() {
    window.app.cancel();
  }

  processBtnLabel() {
    return this.isFinished ? "Process Again" : "Process";
  }
}
</script>

<style scoped>
img {
  width: 100%;
}
</style>
