import { FunctionTool, Context } from "@google/adk";
import { fetchMe } from "../client/userClient.js";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

export const getMeTool = new FunctionTool({
  name: "get_me",
  description:
    "Valida a autenticação do usuário e recupera seus dados (nome, email, loja, plano). Deve ser chamada antes de qualquer ação que precise de dados da loja.",
  execute: async (_input: string, tool_context?: Context) => {
    try {
      const data = await fetchMe();
      console.log({ data }, "----");
      if (tool_context) {
        tool_context.state.set(CONTEXT_KEY.USER_ME, data);
        tool_context.state.set(CONTEXT_KEY.USER_STORE_ID, data.stores?.[0]?.id);
      }

      return JSON.stringify(data);
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return JSON.stringify({
          error: "Usuário não autenticado. Faça login para continuar.",
        });
      }
      const message = error.response?.data?.message ?? error.message;
      return JSON.stringify({
        error: `Erro ao buscar dados do usuário: ${message}`,
      });
    }
  },
});
