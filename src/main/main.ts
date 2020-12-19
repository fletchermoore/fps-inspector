import { app, BrowserWindow } from "electron";
import { protocol } from "electron";
const path = require("path");
const os = require("os");
const { Controller } = require("./controller");

const isDev = process.env.NODE_ENV === "development";

const controller = new Controller();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: !isDev
    }
  });
  if (isDev) {
    // hot reloading and other goodness
    console.log("dev is happening!");
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
    // const ses = mainWindow.webContents.session;
    // ses.loadExtension('%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\nhdogjmejiglipccpnnnanhbledajbpd');
  } else {
    mainWindow.loadFile("public/index.html");
  }

  // Open the DevTools.
  controller.setWindow(mainWindow);
}

app.whenReady().then(function() {
  if (isDev) {
    // this is necessary so we can load local files when index.html does not
    // come from the local disk, but rather http://localhost because I am using
    // webpack dev-server
    protocol.registerFileProtocol("file", (request, callback) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      callback(pathname);
    });
  }
  createWindow();
  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
