<template>
  <div id="image-viewer">
    <img :src="imagePath" />
    <div v-show="imagePath == ''">No image loaded.</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class ImageViewer extends Vue {
  imagePath = "";

  mounted() {
    window.app.on("image-set", (path: string) => {
      this.imagePath = path;
    });
  }
}
</script>

<style scoped>
img {
  width: 100%;
}
</style>
