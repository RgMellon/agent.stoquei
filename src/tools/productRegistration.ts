import { randomBytes } from "crypto";
import { FunctionTool, Context } from "@google/adk";
import { z } from "zod/v4";
import {
  createProduct,
  createVariants,
} from "../client/products/index.js";
import { getAuthContext } from "../helpers/getAuthContext.js";
import { invalidateProductsCache } from "../helpers/productsCache.js";

const generateSku = () => `SKU-${randomBytes(4).toString("hex").toUpperCase()}`;

export const createProductTool = new FunctionTool({
  name: "create_product",
  description:
    "Cria um novo produto na loja. Retorna o produto criado com seu ID para depois criar variantes.",
  parameters: z.object({
    name: z.string().describe("Nome do produto"),
    description: z.string().optional().describe("Descrição do produto"),
    category: z.string().optional().describe("Categoria do produto"),
  }),
  execute: async (
    args: { name: string; description?: string; category?: string },
    tool_context?: Context,
  ) => {
    const auth = getAuthContext(tool_context);
    if ("error" in auth) return JSON.stringify({ error: auth.error });

    try {
      const data = await createProduct({
        token: auth.data.token,
        storeId: auth.data.storeId,
        ...args,
      });
      invalidateProductsCache(tool_context);
      console.log("[create_product] ✅ Produto criado:", { id: data.id, name: args.name });
      return JSON.stringify(data);
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      console.error("[create_product] ❌ Erro:", message);
      return JSON.stringify({ error: `Erro ao criar produto: ${message}` });
    }
  },
});

const variantSchema = z.object({
  priceCost: z.number().min(0).describe("Preço de custo"),
  priceSale: z.number().min(0).describe("Preço de venda"),
  stockQuantity: z.number().min(0).describe("Quantidade em estoque"),
  sku: z.string().optional().describe("Código SKU da variante"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Dados adicionais (cor, tamanho, etc.)"),
});

export const createVariantsTool = new FunctionTool({
  name: "create_variants",
  description:
    "Cria uma ou mais variantes (SKUs) para um produto existente. Cada variante tem preço de custo, preço de venda e estoque.",
  parameters: z.object({
    productId: z.string().describe("ID do produto (retornado ao criar o produto)"),
    variants: z.array(variantSchema).min(1).describe("Lista de variantes a criar"),
  }),
  execute: async (
    args: {
      productId: string;
      variants: Array<{
        priceCost: number;
        priceSale: number;
        stockQuantity: number;
        sku?: string;
        metadata?: Record<string, unknown>;
      }>;
    },
    tool_context?: Context,
  ) => {
    const auth = getAuthContext(tool_context);
    if ("error" in auth) return JSON.stringify({ error: auth.error });

    try {
      const variants = args.variants.map((v) => ({
        ...v,
        sku: v.sku || generateSku(),
      }));

      const data = await createVariants({
        token: auth.data.token,
        productId: args.productId,
        variants,
      });
      invalidateProductsCache(tool_context);
      console.log("[create_variants] ✅ Variantes criadas:", { productId: args.productId, count: args.variants.length });
      return JSON.stringify(data);
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      console.error("[create_variants] ❌ Erro:", message);
      return JSON.stringify({ error: `Erro ao criar variantes: ${message}` });
    }
  },
});
