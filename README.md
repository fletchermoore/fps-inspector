# FPS Inspector

## Description

Part of a research project in progress. Not suitable for production.

## Dependencies

* tessearct command line, available on path
* ffmpeg, on path

## Working in dev mode

1st. yarn serve
2nd. yarn start


## For reference, steps to make vue-veutify-typescript-secure-electron application

Had a difficult time getting everything working, so below is included for reference for future projects. May not be the cleanest way to accomplish this setup.

install vue-cli

### add veutify

`vue add vuetify`

^ src/plugins/veutify.ts -> import Vuetify from "vuetify/lib";
// for some reason the default veutify/lib/framework is wrong

*** must add this before next steps or coding because vue cli will write files in the wrong directories and overwrite your config ***

After this point, our directory structure will be differnt from what vue cli expect, so use it with caution.


### update dir structure to make electron app
move src/* to src/renderer/*
rename main.ts to renderer.ts

*** at this point, do not use vue cli again, which makes incorrect assumptions about your application structure ***

yarn add electron -D

create src/main/main.js from electron sample
add main to package
add start script to package

add env variable: const isDev = process.env.NODE_ENV === "development";

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

add env to vscode task  or launch or some other way
terminal -> configure tasks (npm: start)
add this:

			"options": {
				"env": {
					"NODE_ENV": "development"
				}
			}


### get typescript working on electron side
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

