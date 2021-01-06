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
  private errorCount = 0;
  private progressCount = 0;
  private inProcessCount = 0;
  private batchCount = 3;
  private batchSize = 5;
  private threadCount = 4;
  private threatTestLimit = 101;
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
    console.log("num errors:",this.errorCount);
  }

  notify() {
    this.progress.next({
      progressCount: this.progressCount,
      totalCount: this.matchingFiles.length
    });
    if (this.progressCount >= this.matchingFiles.length) {
      this.finish();
    }
  }

  async start() {
    this.status.next(TaskState.Running);
    this.statusUpdateTimer = setInterval(() => {
      this.notify();
    }, 100);

    this.processNext(0);


    //this.processBatch(0);    
  }

  async processNext(currentIndex: number)
  {
    if (currentIndex < this.threatTestLimit
      && !this.isCanceled)
    {
      const fullPath = this.matchingFiles[currentIndex];
      if (this.inProcessCount < this.threadCount)
      {
        this.processOne(fullPath);
        this.processNext(currentIndex + 1);
      }
      else
      {
        this.processOne(fullPath).then(() => {
          this.processNext(currentIndex + 1);
        })
      }
    }
  }

  // async processBatch(batchNum: number)
  // {
  //   const start = batchNum * this.batchSize;
  //   const end = start + this.batchSize;
  //   let finishedCount = 0;
  //   for (let i = start; i < end; i++) {
  //     if (this.isCanceled) {
  //       break;
  //     } else {
  //       const fullPath = this.matchingFiles[i];
  //       this.processOne(fullPath).then(() => {
  //         finishedCount += 1;
  //         if (finishedCount >= this.batchSize)
  //         {
  //           console.log("finished a batch sync");
  //           if (batchNum < this.batchCount-1)
  //           {
  //             this.processBatch(batchNum + 1);
  //           }            
  //         }
  //       });
  //     }
  //   }
  // }

  async processOne(fullPath: string)
  {
    this.inProcessCount += 1;
    console.log("processing " + fullPath);
    const tesseract = new Tesseract(fullPath);
    try {
      await tesseract.process();
      console.log("successfullly processed " + fullPath);
    } catch (error)
    {
      this.errorCount += 1;
      console.log("ignoring tess error for now", fullPath);
    }    
    this.progressCount += 1;
    this.inProcessCount -= 1;
  }


  async cancel() {
    this.isCanceled = true;
    clearInterval(this.statusUpdateTimer!);
    this.status.next(TaskState.Canceled);
  }
}
