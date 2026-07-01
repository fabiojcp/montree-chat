import styled from "styled-components";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Message } from "../api";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  currentUser: string;
  typingAuthor: string | null;
  onSend: (text: string) => void;
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

const Header = styled.header`
  padding: 16px;
  background: #4caf50;
  color: #fff;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
`;

export default function ChatWindow({
  messages,
  loading,
  currentUser,
  typingAuthor,
  onSend,
}: ChatWindowProps) {
  return (
    <Container>
      <Header>Mini Chat</Header>
      {loading ? (
        <LoadingText>Carregando mensagens...</LoadingText>
      ) : (
        <MessageList
          messages={messages}
          currentUser={currentUser}
          typingAuthor={typingAuthor}
        />
      )}
      <MessageInput onSend={onSend} />
    </Container>
  );
}
