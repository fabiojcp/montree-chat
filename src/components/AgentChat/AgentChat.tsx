import { useState, useEffect, useRef, type FormEvent } from "react";
import styled from "styled-components";
import useAgentChat from "../../hooks/useAgentChat";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: #e8eaf6;
`;

const Bubble = styled.div<{ $role: "user" | "assistant" }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  align-self: ${({ $role }) =>
    $role === "user" ? "flex-end" : "flex-start"};
  background: ${({ $role }) =>
    $role === "user" ? "#e1ffc7" : "#fff"};
  color: #333;
  border-bottom-right-radius: ${({ $role }) =>
    $role === "user" ? "4px" : "12px"};
  border-bottom-left-radius: ${({ $role }) =>
    $role === "user" ? "12px" : "4px"};
`;

const AuthorLabel = styled.span<{ $role: "user" | "assistant" }>`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  padding: 0 4px;
  color: ${({ $role }) => ($role === "user" ? "#4caf50" : "#2196f3")};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
  font-size: 14px;
  text-align: center;
  gap: 8px;
`;

const TypingBubble = styled.div`
  align-self: flex-start;
  max-width: 60%;
  padding: 10px 16px;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  margin-bottom: 10px;
  background: #fff;
  color: #999;
  font-size: 13px;
  font-style: italic;
`;

const Form = styled.form`
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4caf50;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  background: #4caf50;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #43a047;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const BottomRef = styled.div`
  height: 1px;
`;

export default function AgentChat() {
  const { messages, typing, sendMessage } = useAgentChat();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || typing) return;
    sendMessage(text.trim());
    setText("");
  };

  return (
    <Container>
      <Messages>
        {messages.length === 0 && (
          <EmptyState>
            <span>🤖</span>
            <span>Converse com o assistente de IA.</span>
            <span>Digite uma mensagem abaixo para começar.</span>
          </EmptyState>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <AuthorLabel $role={msg.role}>
              {msg.role === "user" ? "Você" : "Assistente"}
            </AuthorLabel>
            <Bubble $role={msg.role}>{msg.content}</Bubble>
          </div>
        ))}

        {typing && (
          <TypingBubble>Assistente está digitando...</TypingBubble>
        )}

        <BottomRef ref={bottomRef} />
      </Messages>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Digite sua mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={typing}
        />
        <SendButton type="submit" disabled={!text.trim() || typing}>
          Enviar
        </SendButton>
      </Form>
    </Container>
  );
}
