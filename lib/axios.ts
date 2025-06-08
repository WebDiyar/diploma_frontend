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

// export const api = createApiClient("https://diploma-project-backend.fly.dev");

export const api = createApiClient("https://diploma-rest-api.fly.dev");
