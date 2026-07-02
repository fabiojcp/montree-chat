import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { useChatContext } from "./context";
import { sanitizeInput } from "../../utils/sanitize";
import { useRateLimit } from "../../hooks/useRateLimit";

const MAX_LENGTH = 500;

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
    border-color: #2e7d32;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  background: #2e7d32;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1b5e20;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export function ChatInput() {
  const { sendMessage } = useChatContext();
  const [text, setText] = useState("");
  const { canSend, markSent } = useRateLimit(1000);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeInput(text, MAX_LENGTH);
    if (!cleaned || !canSend) return;
    sendMessage(cleaned);
    setText("");
    markSent();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        maxLength={MAX_LENGTH}
        placeholder="Digite sua mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <SendButton type="submit" disabled={!text.trim() || !canSend}>
        Enviar
      </SendButton>
    </Form>
  );
}
