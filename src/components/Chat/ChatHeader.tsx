import type { ReactNode } from "react";
import styled from "styled-components";

export interface ChatHeaderProps {
  children?: ReactNode;
}

const Header = styled.header`
  padding: 16px;
  background: #4caf50;
  color: #fff;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
`;

export function ChatHeader({ children }: ChatHeaderProps) {
  return <Header>{children}</Header>;
}
