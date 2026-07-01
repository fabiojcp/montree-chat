import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchMessages,
  sendMessage as apiSendMessage,
  getSimulatedMessage,
} from "../api";

const SIMULATED_INTERVAL = 5000;
const TYPING_DURATION = 2000;

export default function useChat(currentUser) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingAuthor, setTypingAuthor] = useState(null);
  const simulatedIndex = useRef(0);
  const typingTimer = useRef(null);

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
      clearTimeout(typingTimer.current);
    };
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const message = await apiSendMessage({ author: currentUser, text });
      setMessages((prev) => [...prev, message]);
    },
    [currentUser],
  );

  return { messages, loading, typingAuthor, sendMessage };
}
