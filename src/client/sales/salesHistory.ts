import { httpClient, authHeaders } from "../httpClient.js";

interface SalesHistoryParams {
  token: string;
  storeId: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

// Busca o histórico de vendas da loja na API
export const fetchSalesHistory = async ({
  token,
  storeId,
  ...query
}: SalesHistoryParams) => {
  const { data } = await httpClient.get(
    `/sales/stores/${storeId}/history`,
    {
      params: {
        period: query.period,
        ...(query.startDate && { startDate: query.startDate }),
        ...(query.endDate && { endDate: query.endDate }),
      },
      ...authHeaders(token),
    },
  );
  return data;
};
