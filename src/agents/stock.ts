import { LlmAgent } from "@google/adk";
import {
  createProductTool,
  createVariantsTool,
} from "../tools/productRegistration.js";
import { listProductVariantsTool } from "../tools/products.js";
import { productPrompt } from "../prompts/product/index.js";

export const stockAgent = new LlmAgent({
  name: "stock_agent",
  model: "gemini-2.5-flash-lite",
  description:
    "Agente responsável pela gestão de estoque. Use quando o usuário quiser cadastrar, listar, consultar ou gerenciar produtos e variantes.",
  instruction: productPrompt,
  tools: [listProductVariantsTool, createProductTool, createVariantsTool],
});
