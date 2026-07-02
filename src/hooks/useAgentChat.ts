import { useState, useCallback, useRef } from "react";
import { sendToAI, type OpenRouterMessage } from "../api/openrouter";

export interface AgentMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT: OpenRouterMessage = {
  role: "system",
  content:
    "Você é um assistente prestativo e amigável. Responda de forma clara e objetiva. Use português brasileiro, a menos que o usuário fale em outro idioma. Mantenha respostas concisas.",
};

let nextId = 1;

interface UseAgentChatReturn {
  messages: AgentMessage[];
  typing: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export default function useAgentChat(): UseAgentChatReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const idCounter = useRef(nextId);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AgentMessage = {
      id: idCounter.current++,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const history: OpenRouterMessage[] = [
        SYSTEM_PROMPT,
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      const reply = await sendToAI(history);

      const assistantMsg: AgentMessage = {
        id: idCounter.current++,
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AgentMessage = {
        id: idCounter.current++,
        role: "assistant",
        content:
          err instanceof Error
            ? `Erro: ${err.message}`
            : "Erro ao comunicar com o assistente.",
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setTyping(false);
    }
  }, [messages]);

  return { messages, typing, sendMessage };
}
