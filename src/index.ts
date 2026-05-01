import "dotenv/config";
import express from "express";
import cors from "cors";
import { Runner, InMemorySessionService } from "@google/adk";
import { Content } from "@google/genai";
import { agent } from "./agents/agent.js";
import { CONTEXT_KEY } from "./constants/contextKeys.js";

const app = express();
app.use(cors());
app.use(express.json());

const sessionService = new InMemorySessionService();
const runner = new Runner({ agent, appName: "stoquei_agent", sessionService });

// Endpoint principal — recebe mensagem e retorna resposta via SSE
app.post("/api/chat", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Token não informado" });
    return;
  }

  const { userId, sessionId, message } = req.body as {
    userId: string;
    sessionId?: string;
    message: string;
  };

  if (!userId || !message) {
    res.status(400).json({ error: "userId e message são obrigatórios" });
    return;
  }

  // Cria ou recupera a sessão e injeta o token no state
  const sid = sessionId ?? crypto.randomUUID();
  let session = await sessionService.getSession({
    appName: "stoquei_agent",
    userId,
    sessionId: sid,
  });

  if (!session) {
    session = await sessionService.createSession({
      appName: "stoquei_agent",
      userId,
      sessionId: sid,
      state: { [CONTEXT_KEY.AUTH_TOKEN]: token },
    });
  } else {
    session.state[CONTEXT_KEY.AUTH_TOKEN] = token;
  }

  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userMessage: Content = {
    role: "user",
    parts: [{ text: message }],
  };

  // Envia o sessionId como primeiro evento pra o frontend salvar
  res.write(`data: ${JSON.stringify({ sessionId: sid })}\n\n`);

  const run = runner.runAsync({
    userId,
    sessionId: sid,
    newMessage: userMessage,
  });

  for await (const event of run) {
    if (event.content?.parts?.length) {
      const text = event.content.parts
        .map((p) => p.text ?? "")
        .filter(Boolean)
        .join("");

      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
  }

  res.write(`data: [DONE]\n\n`);
  res.end();
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
