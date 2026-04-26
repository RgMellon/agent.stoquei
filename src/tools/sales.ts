import { FunctionTool, Context } from "@google/adk";
import { z } from "zod/v4";
import { fetchSalesHistory, createSale } from "../client/sales/index.js";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

export const searchSalesTool = new FunctionTool({
  name: "search_sales",
  description:
    "Busca e lista o histórico de vendas da loja com filtros de período. Retorna as vendas e um resumo financeiro consolidado.",
  parameters: z.object({
    period: z
      .enum(["today", "last7days", "thisMonth", "all", "custom"])
      .default("thisMonth")
      .describe(
        "Período de busca: today, last7days, thisMonth, all ou custom (requer startDate e endDate)",
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "Data inicial no formato YYYY-MM-DD (apenas quando period=custom)",
      ),
    endDate: z
      .string()
      .optional()
      .describe(
        "Data final no formato YYYY-MM-DD (apenas quando period=custom)",
      ),
  }),
  execute: async (
    {
      period,
      startDate,
      endDate,
    }: { period: string; startDate?: string; endDate?: string },
    tool_context?: Context,
  ) => {
    let storeId = tool_context?.state.get<string>(CONTEXT_KEY.USER_STORE_ID);

    if (!storeId) {
      return JSON.stringify({
        error: "Nenhuma loja encontrada para este usuário.",
      });
    }

    try {
      const data = await fetchSalesHistory({
        storeId,
        period,
        startDate,
        endDate,
      });
      return JSON.stringify(data);
    } catch (error: any) {
      console.error("[search_sales] Erro:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({ error: `Erro ao buscar vendas: ${message}` });
    }
  },
});

export const createSaleTool = new FunctionTool({
  name: "create_sale",
  description:
    "Registra uma nova venda para uma variante específica de um produto. Necessita do variantId (UUID da variante).",
  parameters: z.object({
    variantId: z.string().describe("UUID da variante que está sendo vendida"),
    quantity: z.int().min(1).describe("Quantidade de unidades vendidas"),
    customSalePrice: z
      .number()
      .min(0)
      .optional()
      .describe(
        "Preço de venda customizado. Se não informado, usa o preço padrão da variante",
      ),
    feePercentage: z
      .number()
      .min(0)
      .optional()
      .describe("Taxa percentual sobre a venda (ex: taxa do marketplace)"),
    feeFixedValue: z
      .number()
      .min(0)
      .optional()
      .describe("Taxa fixa sobre a venda (ex: R$ 2,00 por transação)"),
    externalOrderId: z
      .string()
      .max(255)
      .optional()
      .describe(
        "ID do pedido externo (ex: número do pedido no Mercado Livre, Shopee)",
      ),
    saleDate: z
      .string()
      .optional()
      .describe(
        "Data da venda no formato YYYY-MM-DD. Se não informado, usa a data atual",
      ),
  }),
  execute: async (
    args: {
      variantId: string;
      quantity: number;
      customSalePrice?: number;
      feePercentage?: number;
      feeFixedValue?: number;
      externalOrderId?: string;
      saleDate?: string;
    },
    _tool_context?: Context,
  ) => {
    try {
      const data = await createSale(args);
      return JSON.stringify(data);
    } catch (error: any) {
      console.error("[create_sale] Erro:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({ error: `Erro ao registrar venda: ${message}` });
    }
  },
});
