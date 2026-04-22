# Recuperar dados do usuário via /users/me

## Contexto

O endpoint `GET /users/me` retorna os dados do usuário autenticado, incluindo o `storeId` necessário para rotas privadas como a de vendas.

Exemplo de response:

```json
{
  "id": "529bd966-1aa5-40a4-b4ee-972eb4a72a2c",
  "name": "Hikari Crochê",
  "email": "<email>",
  "accountId": "529bd966-1aa5-40a4-b4ee-972eb4a72a2c",
  "tier": {
    "type": "PRO",
    "name": "Pro",
    "hasAiAccess": true
  },
  "subscription": {
    "startDate": "2026-02-10T10:16:45.137Z",
    "expirationDate": "2027-02-10T10:16:45.137Z",
    "daysRemaining": 296,
    "isExpired": false,
    "status": "active"
  },
  "stores": [
    {
      "id": "3d87a83b-bc90-49b9-ad30-853eca5fe93b",
      "name": "Hikari Crochê",
      "logo": null,
      "type": "PRINTER_3D"
    }
  ]
}
```

## Problema atual

- O `STORE_ID` está hardcoded no `.env` e no `salesClient.ts` (com um TODO pra remover)
- Não existe validação de autenticação — se o token for inválido, o erro só aparece na hora da busca

## Como funciona o state no ADK TypeScript

O `FunctionTool` recebe um segundo parâmetro `tool_context` do tipo `Context`, que expõe `tool_context.state` com:

- `user:` — estado do usuário (persistente entre sessões)
- `app:` — estado da aplicação (persistente entre sessões)
- `temp:` — estado temporário (só na sessão atual)

Métodos: `state.get(key)` e `state.set(key, value)`

## Plano de implementação

### Passo 1 — Criar `src/client/userClient.ts`

- Client simples que chama `GET /users/me` via `httpClient`
- Exporta `fetchMe()` que retorna os dados do usuário

### Passo 2 — Criar `src/tools/user.ts`

- Tool `get_me` sem parâmetros
- Chama `fetchMe()` e salva no state:
  - `user:me` → dados completos do usuário
  - `user:storeId` → id da primeira store
- Se falhar (401/403), retorna mensagem: "Usuário precisa estar logado"

### Passo 3 — Atualizar `src/tools/sales.ts`

- Receber `tool_context` no `execute`
- Buscar `storeId` via `tool_context.state.get<string>("user:storeId")`
- Se não existir, retornar erro pedindo pra autenticar primeiro
- Passar `storeId` pro `salesClient`

### Passo 4 — Atualizar `src/client/salesClient.ts`

- Remover `STORE_ID` do `.env` e da constante hardcoded
- `fetchSalesHistory` passa a receber `storeId` como parâmetro

### Passo 5 — Atualizar `src/agents/agent.ts`

- Adicionar tool `get_me` no agente root
- Atualizar instrução: "Antes de delegar tarefas que precisam de dados da loja, use get_me para validar autenticação"

### Passo 6 — Atualizar `.env.example`

- Remover `STORE_ID`

## Caso de falha

- Se `/me` retornar 401/403 → tool retorna erro dizendo que o usuário precisa estar logado
- Se `/me` falhar por outro motivo → tool retorna erro genérico com a mensagem da API
- Se `search_sales` for chamada sem `user:storeId` no state → retorna erro pedindo pra autenticar primeiro
