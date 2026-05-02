import { FunctionTool, Context } from "@google/adk";
import { fetchProducts } from "../client/products/index.js";
import { getAuthContext } from "../helpers/getAuthContext.js";
import { getProductsCache, setProductsCache } from "../helpers/productsCache.js";

export const listProductVariantsTool = new FunctionTool({
  name: "list_product_variants",
  description:
    "Busca todos os produtos da loja com suas variantes (SKU, preço, estoque). Use antes de registrar uma venda para descobrir o variantId.",
  execute: async (_input: string, tool_context?: Context) => {
    const auth = getAuthContext(tool_context);
    if ("error" in auth) return JSON.stringify({ error: auth.error });

    try {
      const cached = getProductsCache(tool_context);
      if (cached) {
        console.log("[list_product_variants] 📦 Retornando do cache");
        return JSON.stringify(cached);
      }

      const data = await fetchProducts(auth.data.token, auth.data.storeId);
      setProductsCache(tool_context, data);
      console.log("[list_product_variants] ✅ Buscou da API e salvou no cache");
      return JSON.stringify(data);
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({ error: `Erro ao buscar produtos: ${message}` });
    }
  },
});
