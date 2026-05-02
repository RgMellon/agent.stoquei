# Cache de State (Session)

Dados que vêm de listagens da API devem ser cacheados no `state` da sessão para evitar chamadas repetidas durante a mesma conversa.

## Como funciona

1. A tool de listagem verifica se já existe cache no state
2. Se existir → retorna direto, sem bater na API
3. Se não existir → busca na API, salva no cache e retorna
4. Tools que criam ou alteram dados **invalidam o cache** após sucesso
5. Próxima listagem busca da API novamente (cache limpo)

## Padrão de implementação

Cada domínio tem um helper em `src/helpers/` com 3 funções:

| Função | Descrição |
|--------|-----------|
| `get*Cache` | Retorna os dados do cache ou `null` |
| `set*Cache` | Salva os dados no cache |
| `invalidate*Cache` | Limpa o cache setando `null` |

### Referência: `src/helpers/productsCache.ts`

```typescript
import { Context } from "@google/adk";
import { CONTEXT_KEY } from "../constants/contextKeys.js";

export const getProductsCache = (tool_context?: Context) =>
  tool_context?.state.get(CONTEXT_KEY.STORE_PRODUCTS) ?? null;

export const setProductsCache = (tool_context: Context | undefined, data: unknown) => {
  tool_context?.state.set(CONTEXT_KEY.STORE_PRODUCTS, data);
};

export const invalidateProductsCache = (tool_context?: Context) => {
  tool_context?.state.set(CONTEXT_KEY.STORE_PRODUCTS, null);
};
```

## Regras importantes

- A classe `State` do ADK só tem `get`, `set`, `has` — **não tem `delete`**
- Para invalidar, use `state.set(chave, null)`
- As chaves de cache ficam em `src/constants/contextKeys.ts`
- Toda tool que **cria ou altera** dados de um domínio deve **invalidar o cache** desse domínio
- Ao criar cache para novos domínios, siga o mesmo padrão do `productsCache.ts`

## Exemplo de uso nas tools

### Tool de listagem (lê do cache)

```typescript
const cached = getProductsCache(tool_context);
if (cached) return JSON.stringify(cached);

const data = await fetchProducts(token, storeId);
setProductsCache(tool_context, data);
return JSON.stringify(data);
```

### Tool de criação (invalida o cache)

```typescript
const data = await createProduct({ ... });
invalidateProductsCache(tool_context);
return JSON.stringify(data);
```
