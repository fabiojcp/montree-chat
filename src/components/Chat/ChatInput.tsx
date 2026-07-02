import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { useChatContext } from "./context";
import { sanitizeInput } from "../../utils/sanitize";
import { useRateLimit } from "../../hooks/useRateLimit";

const MAX_LENGTH = 500;

const SUGGESTIONS = ["oi", "?", "bom dia", "obrigado", "tudo bem?", "kkkk"];

const Wrapper = styled.div`
  border-top: 1px solid #e0e0e0;
  background: #fff;
`;

const Form = styled.form`
  display: flex;
  padding: 10px 16px 6px 16px;
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

const SuggestionsRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 16px 10px 16px;
  overflow-x: auto;
`;

const SuggestionChip = styled.button`
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #f5f5f5;
  color: #555;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function ChatInput() {
  const { sendMessage } = useChatContext();
  const [text, setText] = useState("");
  const { canSend, markSent } = useRateLimit(1000);

  const doSend = (msg: string) => {
    const cleaned = sanitizeInput(msg, MAX_LENGTH);
    if (!cleaned || !canSend) return;
    sendMessage(cleaned);
    setText("");
    markSent();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSend(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    doSend(suggestion);
  };

  return (
    <Wrapper>
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
      <SuggestionsRow>
        {SUGGESTIONS.map((s) => (
          <SuggestionChip
            key={s}
            disabled={!canSend}
            onClick={() => handleSuggestionClick(s)}
          >
            {s}
          </SuggestionChip>
        ))}
      </SuggestionsRow>
    </Wrapper>
  );
}
