export type IByUser= {
    id: number;
    region_id: number;
    region_name: string;
    summa: number;
    count: number;
    task_time: number;
    color:string;
    percent: number;
    oy_1: number;
    oy_2: number;
    oy_3: number;
    oy_4: number;
    oy_5: number;
    oy_6: number;
    oy_7: number;
    oy_8: number;
    oy_9: number;
    oy_10: number;
    oy_11: number;
    oy_12: number;
    oy_1_percent: number;
    oy_2_percent: number;
    oy_3_percent: number;
    oy_4_percent: number;
    oy_5_percent: number;
    oy_6_percent: number;
    oy_7_percent: number;
    oy_8_percent: number;
    oy_9_percent: number;
    oy_10_percent: number;
    oy_11_percent: number;
    oy_12_percent: number;
  }
  
  export type IWorker ={
    id: number;
    fio: string;
    region_id: number;
    region_name: string;
    batalon_name: string;
    summa: number;
    task_time: number;
  }
  
  export type IBatalon ={
    region_id: number;
    region_name: string;
    batalon_id: number;
    batalon_name: string;
    summa: number;
    task_time: number;
  }

  export type IMonthly = {
    month_sum: {
      oy_1: number;
      oy_2: number;
      oy_3: number;
      oy_4: number;
      oy_5: number;
      oy_6: number;
      oy_7: number;
      oy_8: number;
      oy_9: number;
      oy_10: number;
      oy_11: number;
      oy_12: number;
      oy_1_percent: number;
      oy_2_percent: number;
      oy_3_percent: number;
      oy_4_percent: number;
      oy_5_percent: number;
      oy_6_percent: number;
      oy_7_percent: number;
      oy_8_percent: number;
      oy_9_percent: number;
      oy_10_percent: number;
      oy_11_percent: number;
      oy_12_percent: number;
    };
    itogo_year: number;
  };
  
  
  export type IAdminMonitoring = {
    itogo: number;
    byUser: IByUser[];
    workers: IWorker[];
    batalons: IBatalon[];
    month: IMonthly
  }


  export type IBatalonWorker =  {
    id: number;
    fio: string;
    batalon_name: string;
    summa: number;
    task_time: number;
}

export type IUserBatalon = {
  id:number,
  batalon_name: string,
  address: string,
  summa: number;
  count: number;
  color:string;
  percent: number;
  task_time: number;
  oy_1: number;
  oy_2: number;
  oy_3: number;
  oy_4: number;
  oy_5: number;
  oy_6: number;
  oy_7: number;
  oy_8: number;
  oy_9: number;
  oy_10: number;
  oy_11: number;
  oy_12: number;
  oy_1_percent: number;
  oy_2_percent: number;
  oy_3_percent: number;
  oy_4_percent: number;
  oy_5_percent: number;
  oy_6_percent: number;
  oy_7_percent: number;
  oy_8_percent: number;
  oy_9_percent: number;
  oy_10_percent: number;
  oy_11_percent: number;
  oy_12_percent: number;
}

  export type IUserMonitoring = {
    itogo: number;
    workers: IBatalonWorker[];
    byBatalon: IUserBatalon[];
    month: IMonthly
  }
  