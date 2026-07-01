import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Chat } from "./components/Chat";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #e8eaf6;
`;

const NameForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
`;

const NameInput = styled.input`
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  width: 240px;
  text-align: center;

  &:focus {
    border-color: #4caf50;
  }
`;

const NameButton = styled.button`
  padding: 10px 32px;
  border: none;
  border-radius: 24px;
  background: #4caf50;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #43a047;
  }
`;

function getNameFromStorage(): string {
  try {
    return localStorage.getItem("chat-username") || "";
  } catch {
    return "";
  }
}

export default function App() {
  const [username, setUsername] = useState(getNameFromStorage);
  const [nameInput, setNameInput] = useState(getNameFromStorage);

  const handleSetName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem("chat-username", trimmed);
  };

  if (!username) {
    return (
      <AppContainer>
        <NameForm onSubmit={handleSetName}>
          <h2>Bem-vindo ao Mini Chat</h2>
          <NameInput
            type="text"
            placeholder="Seu nome"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <NameButton type="submit">Entrar</NameButton>
        </NameForm>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Chat currentUser={username}>
        <Chat.Header>Mini Chat</Chat.Header>
        <Chat.Messages />
        <Chat.Input />
      </Chat>
    </AppContainer>
  );
}
