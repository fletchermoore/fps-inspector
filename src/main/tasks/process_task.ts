// the main process task, which will execute smaller tasks and emit state
import { BehaviorSubject } from "rxjs";
import { TaskState } from "../../common/constants";
import { Task } from "./task";
import * as files from "../files";
import { Tesseract } from "../tesseract";

export class ProcessTask implements Task {
  public status = new BehaviorSubject(TaskState.Initialized);
  public progress: BehaviorSubject<ProgressState> = new BehaviorSubject({
    progressCount: 0,
    totalCount: 0
  });

  private matchingFiles: string[] = [];
  private isCanceled = false;
  private progressCount = 0;
  private statusUpdateTimer?: NodeJS.Timer;

  constructor(outputDir: string, namePattern: string) {
    try {
      this.matchingFiles = files.matching(outputDir, namePattern);
    } catch (err) {
      console.log(
        "ProcessTask failed at file match with",
        outputDir,
        namePattern
      );
    }
  }

  finish() {
    clearInterval(this.statusUpdateTimer!);
    this.status.next(TaskState.Finished);
  }

  async start() {
    this.status.next(TaskState.Running);
    this.statusUpdateTimer = setInterval(() => {
      this.progress.next({
        progressCount: this.progressCount,
        totalCount: 100
      });
      this.progressCount += 1;
      if (this.progressCount > 100) {
        this.finish();
      }
    }, 100);

    // for (let i = 0; i < this.matchingFiles.length; i++) {
    //     if (this.isCanceled) {
    //         this.status.next(TaskState.Canceled);
    //         break;
    //     } else {
    //         const fullPath = this.matchingFiles[i];
    //         console.log("processing " + fullPath);
    //         const tesseract = new Tesseract(fullPath);
    //         await tesseract.process();
    //         console.log("successfullly processed " + fullPath);
    //     }
    // }
  }

  async cancel() {
    this.isCanceled = true;
    clearInterval(this.statusUpdateTimer!);
    this.status.next(TaskState.Canceled);
  }
}
