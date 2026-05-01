import { Context } from "@google/adk";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

interface AuthContext {
  token: string;
  storeId: string;
}

// Extrai token e storeId do context, retorna erro se faltar algum
export const getAuthContext = (
  tool_context?: Context,
): { data: AuthContext } | { error: string } => {
  const token = tool_context?.state.get<string>(CONTEXT_KEY.AUTH_TOKEN);
  if (!token) return { error: "Usuário não autenticado." };

  const storeId = tool_context?.state.get<string>(CONTEXT_KEY.USER_STORE_ID);
  if (!storeId) return { error: "Nenhuma loja encontrada para este usuário." };

  return { data: { token, storeId } };
};
