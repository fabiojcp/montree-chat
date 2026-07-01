export interface Message {
  id: number;
  author: string;
  text: string;
}

export interface SendMessagePayload {
  author: string;
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, author: "João", text: "Olá, pessoal!" },
  { id: 2, author: "Maria", text: "Oi, João! Tudo bem?" },
  { id: 3, author: "João", text: "Tudo ótimo! E com você?" },
];

const simulatedMessages: Omit<Message, "id">[] = [
  { author: "Ana", text: "Que legal esse chat!" },
  { author: "Carlos", text: "Bom dia a todos!" },
  { author: "João", text: "Alguém viu o jogo ontem?" },
  { author: "Maria", text: "Sim, foi incrível!" },
  { author: "Ana", text: "Vamos marcar algo no fim de semana?" },
  { author: "Carlos", text: "Eu topo!" },
];

let messages: Message[] = [...initialMessages];
let nextId = initialMessages.length + 1;

export function fetchMessages(): Promise<Message[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...messages]);
    }, 300);
  });
}

export function sendMessage(payload: SendMessagePayload): Promise<Message> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const message: Message = { id: nextId++, ...payload };
      messages = [...messages, message];
      resolve(message);
    }, 300);
  });
}

export function getSimulatedMessage(index: number): Message | null {
  if (index >= simulatedMessages.length) return null;
  const msg = simulatedMessages[index];
  return { id: nextId++, author: msg.author, text: msg.text };
}
