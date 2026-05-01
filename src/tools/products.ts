import { FunctionTool, Context } from "@google/adk";
import { fetchProducts } from "../client/products/index.js";
import { CONTEXT_KEY } from "../constants/contextKeys.js";
import { getAuthContext } from "../helpers/getAuthContext.js";

export const listProductVariantsTool = new FunctionTool({
  name: "list_product_variants",
  description:
    "Busca todos os produtos da loja com suas variantes (SKU, preço, estoque). Use antes de registrar uma venda para descobrir o variantId.",
  execute: async (_input: string, tool_context?: Context) => {
    const auth = getAuthContext(tool_context);
    if ("error" in auth) return JSON.stringify({ error: auth.error });

    try {
      const data = await fetchProducts(auth.data.token, auth.data.storeId);

      if (tool_context) {
        tool_context.state.set(CONTEXT_KEY.STORE_PRODUCTS, data);
      }

      return JSON.stringify(data);
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({ error: `Erro ao buscar produtos: ${message}` });
    }
  },
});
