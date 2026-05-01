import { httpClient, authHeaders } from "../httpClient.js";

interface CreateProductParams {
  token: string;
  storeId: string;
  name: string;
  description?: string;
  category?: string;
}

// Cria um novo produto na loja
export const createProduct = async ({
  token,
  storeId,
  name,
  description,
  category,
}: CreateProductParams) => {
  const { data } = await httpClient.post(
    "/products",
    { storeId, name, description, category },
    authHeaders(token),
  );
  return data;
};
