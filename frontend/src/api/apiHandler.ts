import { AxiosRequestConfig } from "axios";
import { apiClient } from "./apiClient";
import Query from "./Query";

export const apiHandler = {
  auth: {
    signIn: (payload: any, options?: AxiosRequestConfig) => {
      return apiClient.post(Query.signIn, payload, options);
    },
  },
  user: {
    list: (options?: AxiosRequestConfig) => {
      return apiClient.get(Query.users, options);
    },
  },
  task: {
    list: (filterString: string = "", options?: AxiosRequestConfig) => {
      return apiClient.get(`${Query.task}?${filterString}`, options);
    },
    get: (id: string, options?: AxiosRequestConfig) => {
      return apiClient.get(`${Query.task}/${id}`, options);
    },
    create: (payload: any, options?: AxiosRequestConfig) => {
      return apiClient.post(Query.task, payload, options);
    },
    update: (id: string, payload: any, options?: AxiosRequestConfig) => {
      return apiClient.patch(`${Query.task}/${id}`, payload, options);
    },
  },
};
