import axios from "axios";

export const systemApi = axios.create({
  baseURL: "https://test-prod.runasp.net/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const anonymousApi = axios.create({
  baseURL: "https://test-prod.runasp.net/api",
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

[systemApi, anonymousApi].forEach((api) => {
  api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });
});