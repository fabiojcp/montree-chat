import { useEffect, useRef } from "react";
import styled from "styled-components";
import MessageItem from "./MessageItem";
import type { Message } from "../api";

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  typingAuthor: string | null;
}

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

export default function MessageList({
  messages,
  currentUser,
  typingAuthor,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAuthor]);

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
