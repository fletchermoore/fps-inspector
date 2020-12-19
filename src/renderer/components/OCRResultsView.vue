<template>
  <div class="d-flex flex-wrap">
    <ocr-result
      v-for="result in results"
      :key="result.id"
      :frame="result.id"
      :ocrNum="result.num"
      :imageSrc="result.src"
      v-on:result-updated="onResultUpdated"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import OCRResult from "./OCRResult.vue";

@Component({
  name: "ocr-results-view",
  components: {
    "ocr-result": OCRResult
  }
})
export default class OCRResultsView extends Vue {
  results = [];
  dirtyUpdate: ResultUpdate[] = [];
  timeouts: NodeJS.Timeout[] = [];

  mounted() {
    // const testPath =
    //   "file:///C:\\Users\\fletcher\\projects\\fps-inspect\\demo\\briefradiant\\briefradiant_0001_tess.jpg";
    // this.imagePath = testPath;

    window.app.on("results-retrieved", (results: any) => {
      this.results = results;
    });

    window.app.retrieveResults();
  }

  onResultUpdated(update: any) {
    if (
      this.dirtyUpdate.filter(priorUpdate => {
        return priorUpdate.frame == update.frame;
      }).length == 0
    ) {
      this.dirtyUpdate.push(update);
    } else {
      this.dirtyUpdate = this.dirtyUpdate.map(priorUpdate => {
        if (priorUpdate.frame == update.frame) {
          return update;
        } else {
          return priorUpdate;
        }
      });
    }
    console.log(this.dirtyUpdate);

    this.clearTimeouts(); // eliminate other updates

    const timeoutId = setTimeout(() => {
      if (this.dirtyUpdate.length > 0) {
        this.sendUpdate();
      } else {
        console.log("timeout called");
      }
    }, 2000);
    // console.log('pushing timeout',timeoutId);

    this.timeouts.push(timeoutId);
  }

  clearTimeouts() {
    for (const timeoutId of this.timeouts) {
      // console.log('clearing timeout', timeoutId);
      clearTimeout(timeoutId);
    }
  }

  sendUpdate() {
    console.log("sending update");
    window.app.updateResults(this.dirtyUpdate);
    this.dirtyUpdate = [];
  }
}
</script>

<style scoped>
img {
  /*width: 100%;*/
}
</style>
