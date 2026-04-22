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

## Chamadas HTTP
- Toda chamada HTTP deve usar o `httpClient` de `src/client/httpClient.ts` (nunca importar axios diretamente)
- O `httpClient` já injeta `baseURL` e `Authorization` via interceptors
- Cada domínio (sales, products, etc.) deve ter seu próprio client em `src/client/` (ex: `salesClient.ts`, `productClient.ts`)
- Os clients exportam funções async que retornam os dados já extraídos da response

## Padrões ADK
- Use FunctionTool para criar ferramentas
- Defina parameters com Zod schemas
- Instruções dos agentes em português
- Exporte agentes como named exports
