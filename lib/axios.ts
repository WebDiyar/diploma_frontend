import axios from "axios";
import { AxiosInstance } from "axios";
import Cookies from "js-cookie";

function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("jwt_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  return instance;
}

export const api = createApiClient("http://localhost:8000");
