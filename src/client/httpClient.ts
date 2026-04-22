import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.API_BASE_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = process.env.API_TOKEN;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
