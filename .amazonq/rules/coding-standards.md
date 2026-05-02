# Padrões de Programação - Stoquei

## Linguagem
- Sempre responda e comente código em português
- Use TypeScript com tipagem estrita

## Nomenclatura
- Nomes de arquivos, funções, variáveis e classes sempre em inglês
- Apenas comentários, instruções de agentes e respostas ao usuário em português

## Estilo de Código
- Use `const` por padrão, `let` apenas quando necessário
- Prefira arrow functions
- Use async/await ao invés de .then()

## Estrutura do Projeto
- Agents ficam em `src/agents/`
- Tools ficam em `src/tools/`
- Use Zod para validação de schemas

## Chamadas HTTP (Clients)
- Toda chamada HTTP deve usar o `httpClient` de `src/client/httpClient.ts` (nunca importar axios diretamente)
- O `httpClient` já injeta `baseURL` e `Authorization` via interceptors
- Cada domínio tem sua própria **pasta** em `src/client/` (ex: `src/client/sales/`, `src/client/products/`)
- Dentro da pasta do domínio, cada operação fica em um arquivo separado (ex: `salesHistory.ts`, `salesCreate.ts`)
- Cada pasta de domínio tem um `index.ts` que re-exporta todas as funções dos arquivos internos
- Os clients exportam funções async que retornam os dados já extraídos da response
- Exemplo de estrutura:
  ```
  src/client/
  ├── httpClient.ts
  └── sales/
      ├── index.ts          ← re-exporta tudo
      ├── salesHistory.ts   ← fetchSalesHistory
      └── salesCreate.ts    ← createSale
  ```

## Prompts
- Cada domínio tem sua própria **pasta** em `src/prompts/` (ex: `src/prompts/sale/`, `src/prompts/product/`)
- Dentro da pasta, cada contexto fica em um arquivo separado (ex: `root.ts`, `search.ts`, `create.ts`)
- Cada pasta tem um `index.ts` que junta todos os prompts com `.join("\n\n")`
- Exemplo de estrutura:
  ```
  src/prompts/
  └── sale/
      ├── index.ts    ← exporta salePrompt (join de todos)
      ├── root.ts     ← instruções gerais do agente
      ├── search.ts   ← instruções de busca
      └── create.ts   ← instruções de criação
  ```

## Padrões ADK
- Use FunctionTool para criar ferramentas
- Defina parameters com Zod schemas
- Instruções dos agentes em português
- Exporte agentes como named exports
- A classe `State` do ADK só tem `get`, `set`, `has` — **não tem `delete`**
