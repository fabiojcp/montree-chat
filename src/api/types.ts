export interface Message {
  id: number;
  author: string;
  text: string;
}

export interface SendMessagePayload {
  author: string;
  text: string;
}
