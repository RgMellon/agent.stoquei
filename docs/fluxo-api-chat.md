# Fluxo da API de Chat (`POST /api/chat`)

Documentação do funcionamento do endpoint principal de comunicação entre o frontend e os agentes.

## Visão Geral

O endpoint `POST /api/chat` recebe uma mensagem do usuário e retorna a resposta do agente via **Server-Sent Events (SSE)**. Cada mensagem enviada pelo frontend abre uma nova conexão HTTP que fica aberta apenas durante o processamento daquela mensagem.

A continuidade da conversa é mantida pela **sessão**, não pela conexão.

## Fluxo Completo

```
Frontend                          Servidor
   │                                 │
   ├── POST /api/chat ──────────────►│
   │   {message, userId}             │
   │                                 ├── 1. Valida token
   │                                 ├── 2. Cria ou recupera sessão
   │                                 ├── 3. Transforma resposta em SSE
   │◄── data: {sessionId} ──────────┤  ← primeiro evento
   │                                 ├── 4. runner.runAsync() inicia
   │◄── data: {text: "..."} ────────┤  ← chunk 1
   │◄── data: {text: "..."} ────────┤  ← chunk 2
   │◄── data: [DONE] ──────────────┤  ← agente terminou
   │                                 ├── 5. res.end() fecha conexão
```

### 1. Validação do Token

O servidor extrai o token do header `Authorization: Bearer <token>`. Se não existir, retorna `401`.

### 2. Criação ou Recuperação da Sessão

- Se o frontend enviou um `sessionId` no body, o servidor tenta buscar a sessão existente no `InMemorySessionService`
- Se não encontrou ou não foi enviado, cria uma nova sessão com um UUID aleatório
- O token de autenticação é injetado no `state` da sessão para que as tools dos agentes consigam acessá-lo

### 3. Transformação em SSE

Os headers da resposta são alterados para SSE:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

A partir daqui a conexão HTTP **fica aberta** e o servidor vai enviando dados aos poucos.

O primeiro evento enviado é o `sessionId`, para que o frontend salve e use nas próximas mensagens.

### 4. Execução do Agente (Streaming)

O `runner.runAsync()` retorna um **async iterator** que gera eventos conforme o agente processa a mensagem. O servidor consome esses eventos com `for await` e filtra:

- **Ignora** eventos que não são do modelo (role !== "model")
- **Ignora** transferências entre agentes (delegação interna)
- **Ignora** function calls (chamadas de tools internas)
- **Envia via SSE** apenas o texto final de resposta ao usuário

Cada chunk de texto é enviado assim que fica disponível, criando o efeito de "digitação em tempo real" (como no ChatGPT).

### 5. Finalização

Quando o async iterator se encerra (o agente não tem mais nada pra fazer), o servidor envia `[DONE]` e fecha a conexão com `res.end()`.

Quem decide quando acabou é o próprio agente — quando ele termina de responder e não tem mais tools pra chamar, o ADK Runner fecha o iterator automaticamente.

## Uma Conexão por Mensagem

Cada mensagem do usuário gera uma **nova requisição HTTP** e uma **nova conexão SSE**:

```
msg 1 → POST /api/chat → abre conexão → chunks... → [DONE] → fecha
msg 2 → POST /api/chat → abre conexão → chunks... → [DONE] → fecha
msg 3 → POST /api/chat → abre conexão → chunks... → [DONE] → fecha
```

O que mantém o contexto da conversa entre as mensagens é o `sessionId`, não a conexão.

## Por que SSE?

O SSE **não** é usado aqui como canal permanente. Ele serve para fazer **streaming da resposta dentro de uma única request**.

Sem SSE, o frontend teria que esperar o agente terminar todo o processamento (que pode levar vários segundos entre chamadas de tools e consultas a APIs) para só então receber a resposta completa de uma vez.

Com SSE, o usuário já vai vendo a resposta sendo construída em tempo real conforme o agente gera os chunks de texto.

> Esse é um padrão comum em APIs de LLM — a própria API da OpenAI funciona assim: POST com resposta SSE.

## Formato dos Eventos SSE

| Evento | Descrição |
|--------|-----------|
| `data: {"sessionId":"uuid"}` | Primeiro evento — ID da sessão para o frontend salvar |
| `data: {"text":"..."}` | Chunk de texto da resposta do agente |
| `data: [DONE]` | Sinaliza que o agente terminou de responder |

## Exemplo de Request

```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-123",
  "sessionId": "uuid-da-sessao-anterior",
  "message": "quais foram minhas vendas hoje?"
}
```

## Limitação

A sessão é armazenada em memória (`InMemorySessionService`). Se o servidor reiniciar, todas as sessões são perdidas. Para produção, seria necessário um session service persistente.
