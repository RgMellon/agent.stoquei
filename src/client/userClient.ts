import { httpClient, authHeaders } from "./httpClient.js";

// Busca os dados do usuário autenticado
export const fetchMe = async (token: string) => {
  const { data } = await httpClient.get("/users/me", authHeaders(token));
  return data;
};
