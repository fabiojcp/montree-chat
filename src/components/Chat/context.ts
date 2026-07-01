import { createContext, useContext } from "react";
import type { Message } from "../../api";

export interface ChatContextValue {
  currentUser: string;
  messages: Message[];
  loading: boolean;
  typingAuthor: string | null;
  sendMessage: (text: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within a <Chat> component");
  }
  return ctx;
}
