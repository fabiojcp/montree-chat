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
  width: 100%;
  height: 100%;
  overflow: hidden;
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
