import { httpClient } from "../httpClient.js";

// Busca os produtos da loja com suas variantes
export const fetchProducts = async (storeId: string) => {
  const { data } = await httpClient.get("/products", {
    params: { storeId },
  });
  return data;
};
