import { FunctionTool, Context } from "@google/adk";
import { fetchProducts } from "../client/products/index.js";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

export const listProductVariantsTool = new FunctionTool({
  name: "list_product_variants",
  description:
    "Busca todos os produtos da loja com suas variantes (SKU, preço, estoque). Use antes de registrar uma venda para descobrir o variantId.",
  execute: async (_input: string, tool_context?: Context) => {
    console.log("[list_product_variants] Tool chamada");

    const storeId = tool_context?.state.get<string>(CONTEXT_KEY.USER_STORE_ID);
    console.log("[list_product_variants] storeId:", storeId);

    if (!storeId) {
      console.log("[list_product_variants] storeId não encontrado no contexto");
      return JSON.stringify({
        error: "Nenhuma loja encontrada para este usuário.",
      });
    }

    try {
      console.log("[list_product_variants] Buscando produtos...");
      const data = await fetchProducts(storeId);
      console.log("[list_product_variants] Produtos encontrados:", JSON.stringify(data).substring(0, 200));

      if (tool_context) {
        tool_context.state.set(CONTEXT_KEY.STORE_PRODUCTS, data);
        console.log("[list_product_variants] Dados salvos no contexto");
      }

      return JSON.stringify(data);
    } catch (error: any) {
      console.error("[list_product_variants] Erro:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({ error: `Erro ao buscar produtos: ${message}` });
    }
  },
});
