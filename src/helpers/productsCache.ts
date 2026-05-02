import { Context } from "@google/adk";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

// Retorna os produtos do cache ou null se não existir
export const getProductsCache = (tool_context?: Context) =>
  tool_context?.state.get(CONTEXT_KEY.STORE_PRODUCTS) ?? null;

// Salva os produtos no cache
export const setProductsCache = (tool_context: Context | undefined, data: unknown) => {
  tool_context?.state.set(CONTEXT_KEY.STORE_PRODUCTS, data);
};

// Limpa o cache para forçar nova busca na API
export const invalidateProductsCache = (tool_context?: Context) => {
  tool_context?.state.set(CONTEXT_KEY.STORE_PRODUCTS, null);
};
