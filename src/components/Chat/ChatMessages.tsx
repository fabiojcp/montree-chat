import { useEffect, useRef } from "react";
import styled from "styled-components";
import MessageItem from "../MessageItem";
import { useChatContext } from "./context";

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const TypingIndicator = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
  padding: 8px 16px;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
`;

export function ChatMessages() {
  const { messages, loading, currentUser, typingAuthor } = useChatContext();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAuthor]);

  if (loading) {
    return (
      <Container>
        <LoadingText>Carregando mensagens...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isMine={msg.author === currentUser}
        />
      ))}
      {typingAuthor && (
        <TypingIndicator>{typingAuthor} está digitando...</TypingIndicator>
      )}
      <div ref={bottomRef} />
    </Container>
  );
}
