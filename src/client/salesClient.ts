import { httpClient } from "./httpClient.js";

interface SalesHistoryParams {
  storeId: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

// Busca o histórico de vendas da loja na API
export const fetchSalesHistory = async (params: SalesHistoryParams) => {
  const { data } = await httpClient.get(
    `/sales/stores/${params.storeId}/history`,
    {
      params: {
        period: params.period,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
      },
    },
  );
  return data;
};
