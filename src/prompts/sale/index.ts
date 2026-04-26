import { saleRoot } from "./root.js";
import { saleSearch } from "./search.js";
import { saleCreate } from "./create.js";

export const salePrompt = [saleRoot, saleSearch, saleCreate].join("\n\n");
