import type { ReactNode } from "react";
import styled from "styled-components";
import useChat from "../../hooks/useChat";
import { ChatContext } from "./context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export interface ChatProps {
  currentUser: string;
  children?: ReactNode;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
`;

export function Chat({ currentUser, children }: ChatProps) {
  const { messages, loading, typingAuthor, sendMessage } = useChat(currentUser);

  return (
    <ChatContext.Provider
      value={{ currentUser, messages, loading, typingAuthor, sendMessage }}
    >
      <Container>{children}</Container>
    </ChatContext.Provider>
  );
}

Chat.Header = ChatHeader;
Chat.Messages = ChatMessages;
Chat.Input = ChatInput;
