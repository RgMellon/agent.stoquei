import { httpClient, authHeaders } from "../httpClient.js";

interface VariantInput {
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  sku?: string;
  metadata?: Record<string, unknown>;
}

interface CreateVariantsParams {
  token: string;
  productId: string;
  variants: VariantInput[];
}

// Cria variantes para um produto existente
export const createVariants = async ({
  token,
  productId,
  variants,
}: CreateVariantsParams) => {
  const { data } = await httpClient.post(
    "/variants",
    { productId, variants },
    authHeaders(token),
  );
  return data;
};
