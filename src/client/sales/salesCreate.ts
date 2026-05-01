import { httpClient, authHeaders } from "../httpClient.js";

interface CreateSaleParams {
  token: string;
  variantId: string;
  quantity: number;
  customSalePrice?: number;
  feePercentage?: number;
  feeFixedValue?: number;
  externalOrderId?: string;
  saleDate?: string;
}

// Registra uma nova venda para uma variante
export const createSale = async ({
  token,
  variantId,
  ...body
}: CreateSaleParams) => {
  const { data } = await httpClient.post(
    `/sales/variants/${variantId}`,
    body,
    authHeaders(token),
  );
  return data;
};
