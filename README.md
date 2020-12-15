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


get typescript working on electron side
^ require -> import { app, BrowserWindow } from 'electron'
^ src/main/main.js to main.ts

-- create separate ts config for electron "tsconfig.electron.json"
-- use different include directories, ignore renderer side
,
    "outDir": "./dist"
  },
  "include": [
    "src/main/*.ts",
  ],
-- set an outdir

-- add compile step prior to run, using second config
"scripts": {
    "start": "tsc -p tsconfig.electron.json && electron .",

-- in tsconfig set module type to commonjs to allow import statements at main.js
"module": "commonjs",