import "dotenv/config";
import { LlmAgent } from "@google/adk";
import { salesAgent } from "./sales.js";
import { stockAgent } from "./stock.js";
import { getMeTool } from "../tools/user.js";
import { rootPrompt } from "../prompts/root.js";

export const agent = new LlmAgent({
  name: "stoquei_agent",
  model: "gemini-2.5-flash-lite",
  description: "Agente principal do Stoquei",
  instruction: rootPrompt,
  tools: [getMeTool],
  subAgents: [salesAgent, stockAgent],
});
