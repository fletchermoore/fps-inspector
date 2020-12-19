import { BrowserWindow } from "electron";
import Model from "./model";

import { ipcMain, dialog } from "electron";

import { ExtractTask } from "./extract_task";
import { TaskState } from "../common/constants";
import { Tesseract } from "./tesseract";
import path from "path";
import fs from "fs";
import * as files from "./files";
import * as constants from "./constants";
import { frameFrom } from "./parser";
//import { Data } from 'electron/main';

export class Controller {
  private mainWindow?: Electron.BrowserWindow;
  private model = new Model();

  constructor() {
    this.setupIpc();
    this.setupNotifications();
  }

  setWindow(window: Electron.BrowserWindow) {
    this.mainWindow = window;
  }

  setupNotifications() {
    this.model.fileNameSubject.subscribe((fileName: string) => {
      this.notifyView("file-selected", fileName);
    });

    this.model.statusSubject.subscribe((status: string) => {
      this.notifyView("status-updated", status);
    });

    this.model.currentImageSubject.subscribe((path: string) => {
      this.notifyView("image-set", path);
    });
  }

  notifyView(channel: string, data: any) {
    this.mainWindow?.webContents.send(channel, data);
  }

  alert(message: string) {
    this.notifyView("alert", message);
  }

  // compromise, convenience
  updateStatus(status: string) {
    this.model.updateStatus(status);
  }

  // run tesseract over all the extracted images
  processImages = async () => {
    try {
      const matchingFiles = files.matching(
        this.model.outputDir(),
        this.model.imageNamePattern()
      );
      console.log("process found # matches: ", matchingFiles.length);
      for (let i = 0; i < matchingFiles.length; i++) {
        const fullPath = matchingFiles[i];
        console.log("processing " + fullPath);
        const tesseract = new Tesseract(fullPath);
        await tesseract.process();
        console.log("successfullly processed " + fullPath);
      }
    } catch (err) {
      this.updateStatus(err);
    }
  };

  writeDataFile = (data: Array<DataPoint>) => {
    let content = "FRAME,IMAGE,COMMENT" + constants.NEWLINE;
    for (let i = 0; i < data.length; i++) {
      // console.log('i',i);
      // console.log('data',data);
      // console.log('position', data.position);
      const dataPoint = data[i];
      const machineChoice =
        dataPoint.position == null ? "" : dataPoint.position[0];
      const imageNumber = dataPoint.human ?? machineChoice;
      const comment =
        dataPoint.human != null ? "human override of " + machineChoice : "";
      const line =
        dataPoint.frame + "," + imageNumber + "," + comment + constants.NEWLINE;
      content += line;
      // console.log(line);
    }
    if (this.model.dataFilePath() != "") {
      fs.writeFile(this.model.dataFilePath(), content, "utf8", result => {
        if (result) {
          this.alert(
            "Could not write to file! Changes not saved. Do you have the .csv file open in another program? Close it and try again."
          );
          this.updateStatus("Recent error: could not save changes");
        } else {
          this.updateStatus(".csv file updated");
        }
      });
    }
  };

  readData = () => {
    const matchingFiles = files.matching(
      this.model.outputDir(),
      this.model.textNamePattern()
    );
    const data: Array<DataPoint> = matchingFiles.map((fullPath: string) => {
      // console.log('found', fullPath);
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        // console.log(content);
        const pattern = /\d+/g;
        const matches = content.match(pattern);
        return {
          frame: frameFrom(fullPath),
          path: fullPath,
          position: matches,
          human: null
        };
      } catch (error) {
        console.log(error);
        console.log("open file failed:", fullPath);
        return {
          frame: frameFrom(fullPath),
          path: fullPath,
          position: ["ERR"],
          human: null
        };
      }
    });
    this.model.setData(data);
  };

  readCsv = (filePath: string) => {
    files.readCsv(filePath);
  };

  // create csv from text data
  createDataFile = () => {
    this.readData();
    this.writeDataFile(this.model.getData());
  };

  // = () => is different from a regular function declaration
  // it allows binding of this when passed as a callback
  // not sure why this works
  onTest = () => {
    this.readCsv(this.model.dataFilePath());
  };

  loadExtracted = () => {
    this.readData();
    this.notifyView("image-set", this.model.framePath(1));
  };

  onOpenFile = () => {
    this.model.updateStatus("Selecting file...");
    const paths = dialog.showOpenDialogSync({
      properties: ["openFile", "multiSelections"]
    });
    if (paths) {
      this.model.setCurrentFile(paths[0]);
      this.model.updateStatus("File selected");
      try {
        this.extractMpeg()
          .then(() => {
            console.log("in theory, extracted, would process...");
            // this.processImages().then(() => {
            //     console.log('in theory processed, try create datafile');
            //     this.createDataFile();
            // })
          })
          .catch(err => {
            // extract failed because output folder already exists, likely
            //console.log(err);
            // so instead try to read all the files in that folder into the model
            this.loadExtracted();
          });
      } catch (err) {
        this.updateStatus(err);
      }
    } else {
      this.model.updateStatus("Idle");
    }
  };

  async extractMpeg() {
    if (!fs.existsSync(this.model.outputDir())) {
      console.log("folder doesnt exist");
      try {
        const extractor = new ExtractTask(this.model.videoPath());
        extractor.status.subscribe((status: TaskState) => {
          this.notifyView("extract-status-updated", status);
        });
        await extractor.start();
      } catch (error) {
        this.updateStatus("Error during video decomposition.");
        console.log(error);
        throw Error("Extraction from mp4 failed");
      }
    } else {
      console.log("folder already exists. skipping extract");
      throw Error("Output folder already exists. Aborted.");
    }
  }

  onRetrieveResults = () => {
    this.notifyView("results-retrieved", this.model.results());
  };

  onUpdateResults = (results: Array<ResultUpdate>) => {
    // console.log(this.model.getData())
    this.model.updateData(results);
    this.writeDataFile(this.model.getData());
    // console.log(this.model.getData());
  };

  setupIpc() {
    const onOpenFile = this.onOpenFile;
    ipcMain.on("select-file", function(event: any) {
      onOpenFile();
    });

    const onTest = this.onTest;
    ipcMain.on("test", function(event: any) {
      onTest();
    });

    const onRetrieveResults = this.onRetrieveResults;
    ipcMain.on("retrieve-results", function(event: any) {
      onRetrieveResults();
    });

    const onUpdateResults = this.onUpdateResults;
    ipcMain.on("update-results", function(
      event: any,
      results: Array<ResultUpdate>
    ) {
      onUpdateResults(results);
    });
  }
}
