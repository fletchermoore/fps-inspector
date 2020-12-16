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

## add veutify

`vue add vuetify`

^ src/plugins/veutify.ts -> import Vuetify from "vuetify/lib";
// for some reason the default veutify/lib/framework is wrong

must do this before next step or coding because default config will overwrite your application

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

add env to vscode task  or launch or some other way
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


-- configure vscode launch
-- needs outFiles specified for sourceMaps to work
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Main Process",
            "type": "node",
            "request": "launch",
            "env": {
                "NODE_ENV": "development"
            },
            "program": "${workspaceFolder}\\dist\\main.js",
            "windows": {
                "runtimeExecutable": "${workspaceRoot}\\node_modules\\.bin\\electron.cmd"
            },
            "args": [
                "."
            ],
            "outputCapture": "std",
            "preLaunchTask": "npm: build-electron",
            "sourceMaps": true,
            "outFiles": [
                "${workspaceFolder}\\dist\\**"
            ]
        }
    ]
-- above launch depends on prelaunch task
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "npm",
			"script": "build-electron",
			"group": "build",
			"problemMatcher": [],
			"label": "npm: build-electron",
			"detail": "tsc -p tsconfig.electron.json"
		}
	]
}
-- not sure why debugger seems to run 2x but it works

