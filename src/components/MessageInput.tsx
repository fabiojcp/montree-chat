import { useState, type FormEvent } from "react";
import styled from "styled-components";

interface MessageInputProps {
  onSend: (text: string) => void;
}

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

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Digite sua mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <SendButton type="submit" disabled={!text.trim()}>
        Enviar
      </SendButton>
    </Form>
  );
}
