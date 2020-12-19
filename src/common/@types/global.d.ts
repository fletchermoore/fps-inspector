export declare global {
  interface Window {
    app: any;
  }

  interface DataPoint {
    frame: string;
    path: string;
    position: RegExpMatchArray | null;
    human: string | null;
  }

  interface Result {
    id: number;
    src: string;
    num: string;
  }

  interface ResultUpdate {
    frame: string;
    value: string;
  }

  interface CSVRow {
    FRAME: string;
    IMAGE: string;
    COMMENT: string;
  }
}
