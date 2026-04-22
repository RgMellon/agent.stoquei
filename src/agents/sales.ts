import { LlmAgent } from "@google/adk";
import { searchSalesTool } from "../tools/sales.js";
import { salePrompt } from "../prompts/sale/index.js";

export const salesAgent = new LlmAgent({
  name: "sales_agent",
  model: "gemini-2.5-flash-lite",
  description:
    "Agente responsável pelo controle de vendas. Use quando o usuário quiser registrar, consultar ou listar vendas.",
  instruction: salePrompt,
  tools: [searchSalesTool],
});
