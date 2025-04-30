// import { getAxios } from "@/config/request";
import { URL } from "@/api";
import axios, { AxiosInstance } from "axios";
import { useSelector } from "react-redux";

const getAxios = (jwt: string): AxiosInstance => {
  return axios.create({
    baseURL: URL,
    headers: {
      Authorization: "Bearer " + jwt,
    },
  });
};
export const useRequest = (): AxiosInstance => {
  const jwt = useSelector((state: any) => state.auth.jwt);
  return getAxios(jwt);
};
