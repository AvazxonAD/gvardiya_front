export type  IWorker = {
    id: number;               // Unique identifier for the worker
    fio: string;              // Full name of the worker
    account_number: string;   // Card number of the worker
    batalon_name: string;     // Name of the batalon
    xisob_raqam: string;      // Account number
  }
  
export type IWorkerData = {
    worker_id: number,
    task_time: number
}