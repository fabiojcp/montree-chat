import styled from "styled-components";
import type { Message } from "../api";

interface MessageItemProps {
  message: Message;
  isMine: boolean;
}

const Wrapper = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  align-items: ${({ $isMine }) => ($isMine ? "flex-end" : "flex-start")};
`;

const Author = styled.span<{ $isMine: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $isMine }) => ($isMine ? "#2e7d32" : "#1565c0")};
  margin-bottom: 4px;
  padding: 0 4px;
`;

const Bubble = styled.div<{ $isMine: boolean }>`
  max-width: 70%;
  padding: 10px 16px;
  border-radius: 18px;
  background: ${({ $isMine }) => ($isMine ? "#e8f5e9" : "#f5f5f5")};
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  border-bottom-right-radius: ${({ $isMine }) => ($isMine ? "4px" : "18px")};
  border-bottom-left-radius: ${({ $isMine }) => ($isMine ? "18px" : "4px")};
`;

export default function MessageItem({ message, isMine }: MessageItemProps) {
  const displayAuthor = isMine ? "Você" : message.author;

  return (
    <Wrapper $isMine={isMine}>
      <Author $isMine={isMine}>{displayAuthor}</Author>
      <Bubble $isMine={isMine}>{message.text}</Bubble>
    </Wrapper>
  );
}
