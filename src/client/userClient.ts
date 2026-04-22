import { httpClient } from "./httpClient.js";

// Busca os dados do usuário autenticado
export const fetchMe = async () => {
  const { data } = await httpClient.get("/users/me");
  return data;
};
