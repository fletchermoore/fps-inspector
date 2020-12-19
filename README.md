# FPS Inspector

## Description

Part of a research project in progress. Not suitable for production.

## Dependencies

* tessearct command line, available on path
* ffmpeg, on path

## Working in dev mode

1.  yarn serve
2.  then yarn start


## For reference, steps to make vue-veutify-typescript-secure-electron application

Had a difficult time getting everything working, so below is included for reference for future projects. May not be the cleanest way to accomplish this setup.

For my original electron project I tried building it from the ground up starting with electron. Added typescript, not too bad. Then realized I would need webpack for a complicated front end. Then started to get frustrating. Added vue. Added vuetify, but eventualy couldn't figure out how to get typescript configured. My recommendation is you START with your front end--vue, react, angular whatever because there seems to be endless pitfalls trying to configure modules and assets. Then add electron for the backend. That seems much easier to go about, and that's I detail below.

### vue, typescript

1. install vue-cli
2. create a project per docs w/ typescript

### add veutify

1. `vue add vuetify`
2. ^ src/plugins/veutify.ts -> `import Vuetify from "vuetify/lib";`
// for some reason the default veutify/lib/framework is wrong

**must add this before next steps or coding because vue cli will write files in the wrong directories and overwrite your config**

After this point, our directory structure will be differnt from what vue cli expect, so use it with caution.


### electron

1. update dir structure to make electron app:
   1. move src/* to src/renderer/*
   2. rename main.ts to renderer.ts
   3. update vue.config.js to reflect new entry point (reference webpack chain config project)

            module.exports = {
                transpileDependencies: ["vuetify"],
                chainWebpack: config => {
                    config
                    .entry("app")
                    .clear()
                    .add("./src/renderer/renderer.ts");
                }`
            };

**at this point, do not use vue cli again, which makes incorrect assumptions about your application structure**

1. `yarn add electron -D`
2. create src/main/main.js from electron sample
3. add main to package
4. add start script to package
5. add env variable: const isDev = process.env.NODE_ENV === "development";

        if (isDev) {
            // hot reloading and other goodness
            console.log("dev is happening!");
            win.loadURL("http://localhost:8080");
            win.webContents.openDevTools();
            // const ses = mainWindow.webContents.session;
            // ses.loadExtension('%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\nhdogjmejiglipccpnnnanhbledajbpd');

        }
        else {
            console.log("production mode");
            win.loadFile('public/index.html');
        }

6. add env to vscode task  or launch or some other way
   1. terminal -> configure tasks (npm: start)
   2. add this:

			"options": {
				"env": {
					"NODE_ENV": "development"
				}
			}


### get typescript working on electron side

1. ^ require statement -> `import { app, BrowserWindow } from 'electron'`
2. ^ src/main/main.js to main.ts
3. create separate ts config for electron "tsconfig.electron.json"
3. use different include directories, ignore renderer side

        ,
            "outDir": "./dist"
        },
        "include": [
            "src/main/*.ts",
        ],

4. set an outdir
5. add compile step prior to run, using second config

        "scripts": {
            "start": "tsc -p tsconfig.electron.json && electron .",

7. in tsconfig set module type to commonjs to allow import statements at main.js

        "module": "commonjs",


### configure vscode launch

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
            "program": "${workspaceFolder}\\dist\\main\\main.js",
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

