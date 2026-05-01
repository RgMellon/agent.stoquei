import { httpClient, authHeaders } from "../httpClient.js";

// Busca os produtos da loja com suas variantes
export const fetchProducts = async (token: string, storeId: string) => {
  const { data } = await httpClient.get("/products", {
    params: { storeId },
    ...authHeaders(token),
  });
  return data;
};
