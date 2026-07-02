import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Chat } from "./components/Chat";
import { WizardChat } from "./components/WizardChat";
import { AgentChat } from "./components/AgentChat";
import type { PokemonDetail } from "./api/pokemon";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: 100vh;
  padding: 0;
  background: #e8eaf6;

  @media (min-width: 640px) {
    padding: 20px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  height: 100%;
  background: #fff;
  overflow: hidden;

  @media (min-width: 640px) {
    max-height: 85vh;
    border-radius: 8px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-bottom: 3px solid ${({ $active }) => ($active ? "#4caf50" : "transparent")};
  background: ${({ $active }) => ($active ? "#fff" : "#f9f9f9")};
  color: ${({ $active }) => ($active ? "#4caf50" : "#666")};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: #fff;
    color: #333;
  }
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

const PokemonBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const PokemonBadgeSprite = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const PokemonBadgeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
`;

const ChatHeader = styled.header`
  padding: 12px 16px;
  background: #4caf50;
  color: #fff;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
`;

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

function getNameFromStorage(): string {
  try {
    return localStorage.getItem("chat-username") || "";
  } catch {
    return "";
  }
}

function getPokemonFromStorage(): {
  name: string;
  sprite: string | null;
} | null {
  try {
    const raw = localStorage.getItem("chat-pokemon");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

type TabId = "chat" | "pokemon" | "agent";

export default function App() {
  const [username, setUsername] = useState(getNameFromStorage);
  const [nameInput, setNameInput] = useState(getNameFromStorage);
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [pokemon, setPokemon] = useState(getPokemonFromStorage);

  const handleSetName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem("chat-username", trimmed);
  };

  const handleSelectPokemon = (detail: PokemonDetail) => {
    const data = {
      name: detail.name,
      sprite:
        detail.sprites.other["official-artwork"].front_default ||
        detail.sprites.front_default,
    };
    setPokemon(data);
    try {
      localStorage.setItem("chat-pokemon", JSON.stringify(data));
    } catch {
      // localStorage not available
    }
    setActiveTab("chat");
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
      <ContentWrapper>
        <TabBar>
          <Tab
            $active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </Tab>
          <Tab
            $active={activeTab === "pokemon"}
            onClick={() => setActiveTab("pokemon")}
          >
            Pokémon
            <br />
            <span style={{ fontSize: 10, fontWeight: 400 }}>árvore de decisão</span>
          </Tab>
          <Tab
            $active={activeTab === "agent"}
            onClick={() => setActiveTab("agent")}
          >
            IA
          </Tab>
        </TabBar>

        {pokemon && (
          <PokemonBadge>
            {pokemon.sprite && (
              <PokemonBadgeSprite src={pokemon.sprite} alt={pokemon.name} />
            )}
            <PokemonBadgeName>{pokemon.name}</PokemonBadgeName>
          </PokemonBadge>
        )}

        {activeTab === "chat" && (
          <>
            <ChatHeader>Mini Chat</ChatHeader>
            <ChatBody>
              <Chat currentUser={username}>
                <Chat.Messages />
                <Chat.Input />
              </Chat>
            </ChatBody>
          </>
        )}

        {activeTab === "pokemon" && (
          <ChatBody>
            <WizardChat onSelectPokemon={handleSelectPokemon} />
          </ChatBody>
        )}

        {activeTab === "agent" && (
          <ChatBody>
            <AgentChat />
          </ChatBody>
        )}
      </ContentWrapper>
    </AppContainer>
  );
}
