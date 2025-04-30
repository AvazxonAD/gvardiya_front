export type ITask = {
  id: number;
  birgada: boolean;
  batalon_id: number;
  batalon_name: string;
  task_time: number;
  unique_id: number;
  comment: string;
  summa: number;
  result_summa: number;
  discount_money: number;
  worker_number: number;
  remaining_task_time: number;
  task_date: string;
  contract_number: string;
  bxm_id: number;
  address: string;
};

export type ITaskWorker = {
  worker_id: number;
  fio: string;
  summa: number;
  task_time: number;
};
