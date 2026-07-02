import MockAdapter from "axios-mock-adapter";
import client from "./client";
import type { Message, SendMessagePayload } from "./types";

const initialMessages: Message[] = [
  { id: 1, author: "João", text: "Olá, pessoal!" },
  { id: 2, author: "Maria", text: "Oi, João! Tudo bem?" },
  { id: 3, author: "João", text: "Tudo ótimo! E com você?" },
];

let messages: Message[] = [...initialMessages];
let nextId = initialMessages.length + 1;

export function setupMocks(): void {
  const mock = new MockAdapter(client, { delayResponse: 300 });

  mock.onGet("/messages").reply(200, [...messages]);

  mock.onPost("/messages").reply((config) => {
    const payload: SendMessagePayload = JSON.parse(config.data);
    const message: Message = { id: nextId++, ...payload };
    messages = [...messages, message];
    return [201, message];
  });
}
