// lib/axios.ts
import axios from "axios";
import {AxiosInstance} from "axios";
import Cookies from "js-cookie";

function createApiClient(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      (error) => Promise.reject(error)
    );
  
    return instance;
  }
  
  export const api = createApiClient(
    "http://localhost:8000"
  );
  
// const api = axios.create({
//   baseURL: "http://localhost:8000",
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get("jwt_token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log("🔥 JWT отправлен с запросом:", token);
//     } else {
//       console.warn("❌ JWT токен не найден в cookie");
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;
