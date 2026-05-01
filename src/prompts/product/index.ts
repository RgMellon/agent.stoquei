import { productRoot } from "./root.js";
import { productCreate } from "./create.js";

export const productPrompt = [productRoot, productCreate].join("\n\n");
