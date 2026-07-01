import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchMessages,
  sendMessage as apiSendMessage,
  getSimulatedMessage,
} from "../api";
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
    fetchMessages().then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const message = getSimulatedMessage(simulatedIndex.current);
      if (!message) {
        clearInterval(interval);
        return;
      }

      setTypingAuthor(message.author);

      typingTimer.current = setTimeout(() => {
        setTypingAuthor(null);
        setMessages((prev) => [...prev, message]);
        simulatedIndex.current += 1;
      }, TYPING_DURATION);
    }, SIMULATED_INTERVAL);

    return () => {
      clearInterval(interval);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const message = await apiSendMessage({ author: currentUser, text });
      setMessages((prev) => [...prev, message]);
    },
    [currentUser],
  );

  return { messages, loading, typingAuthor, sendMessage };
}
