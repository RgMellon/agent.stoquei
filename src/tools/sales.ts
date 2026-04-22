import { FunctionTool, Context } from "@google/adk";
import { z } from "zod/v4";
import { fetchSalesHistory } from "../client/salesClient.js";
import { fetchMe } from "../client/userClient.js";

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
    let storeId = tool_context?.state.get<string>("user:storeId");

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
