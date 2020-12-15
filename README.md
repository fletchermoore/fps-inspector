# electrontest

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### steps

install vue-cli

move src to src/renderer
rename main.ts to renderer.ts

yarn add electron -D

create src/main/main.js from electron sample
add main to package
add start script to package

add env variable: const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
        // hot reloading and other goodness
        console.log("dev is happening!");
        win.loadURL("http://localhost:8081");
        win.webContents.openDevTools();
        // const ses = mainWindow.webContents.session;
        // ses.loadExtension('%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\nhdogjmejiglipccpnnnanhbledajbpd');

    }
    else {
        console.log("production mode");
        win.loadFile('public/index.html');
    }

add env to vscode task 
terminal -> configure tasks (npm: start)
add this:
			"options": {
				"env": {
					"NODE_ENV": "development"
				}
			}