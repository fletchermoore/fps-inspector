const { app, BrowserWindow } = require('electron')

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 1024,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (isDev) {
        // hot reloading and other goodness
        console.log("dev is happening!");
        win.loadURL("http://localhost:8081");
        win.webContents.openDevTools();
        // const ses = win.webContents.session;
        // ses.loadExtension('%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\nhdogjmejiglipccpnnnanhbledajbpd');

    }
    else {
        console.log("production mode");
        win.loadFile('public/index.html');
    }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})