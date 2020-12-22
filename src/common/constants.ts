export enum TaskState {
  Initialized = "initialized",
  Running = "running",
  Canceling = "canceling",
  Finished = "finished",
  Canceled = "canceled",
  Failed = "failed"
}

export enum Message {
  ProcessStatusUpdated = "process-status-updated",
  ProcessProgressUpdated = "process-progress-updated",
  Cancel = "cancel"
}
