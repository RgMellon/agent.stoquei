import { httpClient } from "../httpClient.js";

interface CreateSaleParams {
  variantId: string;
  quantity: number;
  customSalePrice?: number;
  feePercentage?: number;
  feeFixedValue?: number;
  externalOrderId?: string;
  saleDate?: string;
}

// Registra uma nova venda para uma variante
export const createSale = async ({ variantId, ...body }: CreateSaleParams) => {
  const { data } = await httpClient.post(`/sales/variants/${variantId}`, body);
  return data;
};
