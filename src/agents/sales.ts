import { LlmAgent } from "@google/adk";
import { searchSalesTool, createSaleTool } from "../tools/sales.js";
import { listProductVariantsTool } from "../tools/products.js";
import { salePrompt } from "../prompts/sale/index.js";

export const salesAgent = new LlmAgent({
  name: "sales_agent",
  model: "gemini-2.5-flash-lite",
  description:
    "Agente responsável pelo controle de vendas. Use quando o usuário quiser registrar, consultar ou listar vendas.",
  instruction: salePrompt,
  tools: [searchSalesTool, createSaleTool, listProductVariantsTool],
});
