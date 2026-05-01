import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.API_BASE_URL,
});

// Retorna o header de autenticação para usar por request
export const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
