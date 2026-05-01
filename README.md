# Stoquei ADK Agent

Assistente de IA para o **Stoquei** — sistema de gestão de estoque e vendas. Construído com [Google Agent Development Kit (ADK)](https://github.com/google/adk-node) e TypeScript.

## Executando o projeto

### Pré-requisitos

- Node.js 20+
- Yarn ou npm
- Chave de API do Google Gemini

### Instalação

```bash
git clone <repo-url>
cd adk-stoquei
yarn install
```

### Configuração

Copie o `.env.example` e preencha as variáveis:

```bash
cp .env.example .env
```

```env
GOOGLE_GENAI_USE_VERTEXAI=false
GOOGLE_GENAI_API_KEY=sua-chave-aqui

API_BASE_URL=http://localhost:3000
API_TOKEN=seu-token-aqui
```

### Executando local com ADK Dev UI

O modo mais prático para testar e debugar os agentes:

```bash
yarn adk
```

Isso abre a interface web do ADK em `http://localhost:3000` onde você pode conversar com o agente diretamente pelo navegador.

> Internamente roda: `node --env-file=.env node_modules/.bin/adk web ./src/agents/agent.ts`

### Executando como servidor (API SSE)

Para integrar com um frontend via Server-Sent Events:

```bash
yarn start
```

O servidor Express sobe na porta configurada (padrão `3000`) com o endpoint `POST /api/chat`.

---

## Arquitetura

### Agentes

O sistema usa uma hierarquia de agentes com delegação automática:

```
stoquei_agent (principal)
├── sales_agent      → vendas
└── stock_agent      → estoque e produtos
```

- **stoquei_agent** — Orquestra as requisições, valida autenticação via `get_me` e delega para sub-agentes
- **sales_agent** — Consulta histórico de vendas e registra novas vendas
- **stock_agent** — Cadastra produtos e variantes, consulta estoque

### Tools (Ferramentas)

| Tool | Agente | Descrição |
|------|--------|-----------|
| `get_me` | principal | Valida autenticação e recupera dados do usuário/loja |
| `search_sales` | vendas | Busca histórico de vendas com filtros de período |
| `create_sale` | vendas | Registra uma nova venda |
| `list_product_variants` | vendas / estoque | Lista produtos e variantes da loja |
| `create_product` | estoque | Cria um novo produto |
| `create_variants` | estoque | Cria variantes (SKUs) para um produto |

### Estrutura de pastas

```
src/
├── agents/          → Definição dos agentes (principal + sub-agentes)
├── client/          → Clients HTTP por domínio (sales/, products/)
│   └── httpClient.ts
├── constants/       → Chaves de contexto compartilhadas
├── helpers/         → Utilitários (ex: extração de auth do context)
├── prompts/         → Instruções dos agentes por domínio (sale/, product/)
├── tools/           → Ferramentas expostas aos agentes
└── index.ts         → Servidor Express com endpoint SSE
```

### Stack

- **Google ADK** — Framework de agentes
- **Gemini 2.5 Flash Lite** — Modelo LLM
- **TypeScript** — Linguagem
- **Zod** — Validação de schemas das tools
- **Axios** — Client HTTP (via `httpClient` centralizado)
- **Express** — Servidor API com SSE

---

## API

### `POST /api/chat`

Endpoint de chat via Server-Sent Events.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "opcional-uuid",
  "message": "quais foram minhas vendas hoje?"
}
```

**Response (SSE):**
```
data: {"sessionId":"uuid-da-sessao"}
data: {"text":"Aqui estão suas vendas de hoje..."}
data: [DONE]
```
