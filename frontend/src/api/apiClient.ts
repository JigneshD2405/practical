import { ApiResponseData } from "@/types";
import { decrypt } from "@/Utils/helpers";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { logout } from "../redux/slices/authSlice";
import { store } from "../redux/store";

const baseURL = process?.env?.VITE_BACKEND_API || "http://localhost:8080";

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use(
  (config) => {
    const token = decrypt(Cookies.get("token") || "");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject({
      error,
      message: error?.response?.data?.message || "Something Went Wrong !!",
    });
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponseData<any>, any>) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith("/admin")) {
        Cookies.remove("token");
        store.dispatch(logout());
      }

      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject({
      error,
      message: error?.response?.data?.message || "Something Went Wrong !!",
    });
  },
);
