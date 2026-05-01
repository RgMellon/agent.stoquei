import "dotenv/config";
import { LlmAgent } from "@google/adk";
import { salesAgent } from "./sales.js";
import { stockAgent } from "./stock.js";
import { getMeTool } from "../tools/user.js";

export const agent = new LlmAgent({
  name: "stoquei_agent",
  model: "gemini-2.5-flash-lite",
  description: "Agente principal do Stoquei",
  instruction:
    "Você é o assistente principal do Stoquei, um sistema de gestão de estoque e vendas. " +
    "Antes de delegar qualquer tarefa que precise de dados da loja, use a ferramenta get_me para validar a autenticação do usuário. " +
    "Se o usuário não estiver autenticado, avise que ele precisa fazer login. " +
    "Delegue tarefas de vendas ao agente de vendas. Responda sempre em português.",
  tools: [getMeTool],
  subAgents: [salesAgent, stockAgent],
});
