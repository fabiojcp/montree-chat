import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient, getNextSimulated } from "../api";
import type { Message } from "../api";

const SIMULATED_INTERVAL = 5000;
const TYPING_DURATION = 2000;

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  typingAuthor: string | null;
  sendMessage: (text: string) => Promise<void>;
}

export default function useChat(currentUser: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingAuthor, setTypingAuthor] = useState<string | null>(null);
  const simulatedIndex = useRef(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiClient.get<Message[]>("/messages").then(({ data }) => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const payload = getNextSimulated(simulatedIndex.current);
      if (!payload) {
        clearInterval(interval);
        return;
      }

      setTypingAuthor(payload.author);

      typingTimer.current = setTimeout(async () => {
        setTypingAuthor(null);

        try {
          const { data } = await apiClient.post<Message>("/messages", payload);
          setMessages((prev) => [...prev, data]);
          simulatedIndex.current += 1;
        } catch {
          simulatedIndex.current += 1;
        }
      }, TYPING_DURATION);
    }, SIMULATED_INTERVAL);

    return () => {
      clearInterval(interval);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const { data } = await apiClient.post<Message>("/messages", {
        author: currentUser,
        text,
      });
      setMessages((prev) => [...prev, data]);
    },
    [currentUser],
  );

  return { messages, loading, typingAuthor, sendMessage };
}
