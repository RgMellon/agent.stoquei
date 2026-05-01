# API de Chat — Stoquei Agent

Endpoint de chat com IA via **Server-Sent Events (SSE)**. O frontend envia uma mensagem e recebe a resposta do agente em tempo real, token por token.

---

## Endpoint

```
POST /api/chat
```

**Base URL (local):** `http://localhost:3000`

---

## Headers obrigatórios

| Header          | Valor                  | Descrição                          |
|-----------------|------------------------|------------------------------------|
| `Authorization` | `Bearer <token>`       | Token de autenticação do usuário   |
| `Content-Type`  | `application/json`     | Tipo do body                       |

---

## Body (JSON)

| Campo       | Tipo     | Obrigatório | Descrição                                                                 |
|-------------|----------|-------------|---------------------------------------------------------------------------|
| `userId`    | `string` | ✅ Sim      | Identificador único do usuário                                            |
| `sessionId` | `string` | ❌ Não      | ID da sessão de conversa. Se não enviar, o backend gera um automaticamente. Envie nas mensagens seguintes para manter o contexto da conversa |
| `message`   | `string` | ✅ Sim      | Mensagem do usuário                                                       |

---

## Resposta (SSE — Server-Sent Events)

A resposta vem como stream de eventos SSE. Cada linha segue o formato `data: <json>\n\n`.

### Ordem dos eventos

1. **Primeiro evento** — `sessionId` da conversa (salvar no frontend para enviar nas próximas mensagens)
2. **N eventos de texto** — Pedaços da resposta do agente (podem vir vários)
3. **Último evento** — Marcador de fim `[DONE]`

### Formato dos eventos

```
data: {"sessionId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}

data: {"text":"Olá! Encontrei 3 vendas hoje:\n\n"}

data: {"text":"1. Venda #123 — R$ 50,00\n2. Venda #124 — R$ 30,00\n"}

data: [DONE]
```

> **Nota:** O texto pode vir fragmentado em vários eventos `{"text": "..."}`. O frontend deve concatenar todos os textos recebidos para montar a resposta completa.

---

## Erros

Erros retornam JSON normal (não SSE):

| Status | Body                                              | Causa                          |
|--------|---------------------------------------------------|--------------------------------|
| `401`  | `{"error": "Token não informado"}`                | Header Authorization ausente   |
| `400`  | `{"error": "userId e message são obrigatórios"}`  | Body incompleto                |

---

## Exemplos com curl

### Primeira mensagem (sem sessionId)

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "message": "quais foram minhas vendas de hoje?"
  }'
```

**Resposta:**

```
data: {"sessionId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}

data: {"text":"Encontrei 3 vendas realizadas hoje:\n\n1. Venda #101 — R$ 45,00\n2. Venda #102 — R$ 120,00\n3. Venda #103 — R$ 30,00\n\nTotal: R$ 195,00"}

data: [DONE]
```

### Mensagem seguinte (com sessionId para manter contexto)

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "message": "e dessa semana?"
  }'
```

> O agente lembra do contexto anterior e entende que você está perguntando sobre vendas da semana.

---

## Implementação no frontend (referência)

### Fluxo básico

1. Usuário envia mensagem → `POST /api/chat` com `userId`, `message` e `sessionId` (se existir)
2. Ler o stream SSE:
   - Primeiro evento: salvar o `sessionId` para usar nas próximas mensagens
   - Eventos de texto: concatenar e exibir em tempo real (efeito de digitação)
   - `[DONE]`: stream terminou, resposta completa
3. Próxima mensagem: enviar o mesmo `sessionId` para manter a conversa

### Exemplo com fetch + ReadableStream

```typescript
const sendMessage = async (message: string, userId: string, sessionId?: string) => {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, sessionId, message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let savedSessionId = sessionId;
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const payload = line.replace("data: ", "");

      // Fim do stream
      if (payload === "[DONE]") break;

      const data = JSON.parse(payload);

      // Primeiro evento — salvar sessionId
      if (data.sessionId) {
        savedSessionId = data.sessionId;
        continue;
      }

      // Texto da resposta — concatenar e exibir
      if (data.text) {
        fullText += data.text;
        // Atualizar a UI aqui (efeito de digitação)
      }
    }
  }

  return { sessionId: savedSessionId, text: fullText };
};
```

### Dicas de UX

- Mostrar um indicador de "digitando..." enquanto o stream estiver aberto
- Renderizar o texto com suporte a **Markdown** (o agente pode responder com listas, negrito, etc.)
- Desabilitar o input enquanto aguarda a resposta
- Guardar o `sessionId` no state do componente para manter o histórico da conversa
