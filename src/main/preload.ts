"use strict";
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// my own custom NODE_MODULES are not allowed due to sandbox

const { contextBridge, ipcRenderer } = require("electron");

// allowing any channel to be used is not safe because
// ipcRenderer can send to some electron native channels
const channelWhiteList = [
  "file-selected",
  "status-updated",
  "image-set",
  "results-retrieved",
  "alert",
  "extract-status-updated"
];

contextBridge.exposeInMainWorld("app", {
  selectFile: () => {
    ipcRenderer.send("select-file");
  },

  test: () => {
    ipcRenderer.send("test");
  },

  retrieveResults: () => {
    ipcRenderer.send("retrieve-results");
  },

  updateResults: (results: any) => {
    ipcRenderer.send("update-results", results);
  },

  on: (channel: string, cb: any) => {
    if (channelWhiteList.includes(channel)) {
      ipcRenderer.on(channel, (event: any, data: any) => {
        cb(data);
      });
    } else {
      console.log("invalid channel: " + channel);
    }
  }
});
