import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../api";
import type { Message } from "../api";

const SIMULATED_INTERVAL = 5000;
const TYPING_DURATION = 2000;
const REPLY_DELAY = 2500;

interface ReplyResult {
  author: string;
  text: string;
}

const AUTHORS = ["João", "Maria", "Ana", "Carlos"];

function pickAuthor(): string {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

function getReplyFor(text: string, username: string): ReplyResult | null {
  const msg = text.toLowerCase().trim();
  const user = username;

  const patterns: Array<{ test: (m: string) => boolean; replies: string[] }> = [
    {
      test: (m) => m === "?" || m === "??" || m.startsWith("??"),
      replies: [
        "Boa pergunta, {user}!",
        "Essa é difícil... {user}, o que você acha?",
        "Hmm, {user}, nem sei! O que você pensa sobre isso?",
      ],
    },
    {
      test: (m) => /^[oi]{2,4}|^ol[áa]|^hey|^e[ai]|^iae|^opa|^salve/i.test(m),
      replies: [
        "Olá, {user}!",
        "Oi, {user}! Tudo bem?",
        "E aí, {user}! Como vai?",
        "Opa, {user}!",
      ],
    },
    {
      test: (m) => /\bbom dia\b/i.test(m),
      replies: [
        "Bom dia, {user}!",
        "Bom dia! Tudo certo por aí?",
        "Bom dia! Dormiu bem?",
      ],
    },
    {
      test: (m) => /\bboa tarde\b/i.test(m),
      replies: [
        "Boa tarde, {user}!",
        "Boa tarde! Como vai?",
        "Boa tarde! Trabalhando muito?",
      ],
    },
    {
      test: (m) => /\bboa noite\b/i.test(m),
      replies: [
        "Boa noite, {user}!",
        "Boa noite! Descansando?",
      ],
    },
    {
      test: (m) =>
        /\btudo bem\b|\bcomo (vai|está|cê tá|vc tá)\b/i.test(m),
      replies: [
        "Tudo ótimo, {user}! E aí, como vai você?",
        "Tudo bem, graças a Deus! E você, {user}?",
        "Tudo tranquilo, {user}!",
      ],
    },
    {
      test: (m) =>
        /\bobrigad[oa]\b|\bvaleu\b|\bbrigad[ao]\b|vlw\b|tks|thx|thanks/i.test(m),
      replies: [
        "De nada, {user}!",
        "Imagina, {user}!",
        "Por nada!",
        "Tamo junto, {user}!",
      ],
    },
    {
      test: (m) =>
        /\btchau\b|\bat[ée] mais\b|\bflw\b|\bfalou\b|\bate logo\b/i.test(m),
      replies: [
        "Até mais, {user}!",
        "Falou, {user}!",
        "Tchau tchau, {user}! Volte sempre!",
      ],
    },
    {
      test: (m) =>
        /kkk|haha|hehe|rsrs|rs |lol|lmao|huehue|hsuah/i.test(m),
      replies: [
        "kkkkkk essa foi boa, {user}!",
        "hahaha {user}, você é engraçado!",
        "rsrs verdade!",
        "KKKK rachei!",
      ],
    },
    {
      test: (m) =>
        /\blegal\b|\bmaneiro\b|\bdaora\b|\bmassa\b|\bda hora\b|\bfoda\b|\bincrível\b|\bmaravilha\b/i.test(m),
      replies: [
        "Né, {user}? Muito legal mesmo!",
        "Demais!",
        "Concordo, {user}!",
      ],
    },
    {
      test: (m) => /^\s*sim\s*$|^\s*claro\s*$|^\s*com certeza\s*$|^\s*lógico\s*$/i.test(m),
      replies: [
        "Concordo, {user}!",
        "Também acho!",
        "Exatamente!",
      ],
    },
    {
      test: (m) =>
        /^\s*n[aã]o\s*$|^\s*nada a ver\s*$/i.test(m),
      replies: [
        "Por que não, {user}?",
        "Sério? Me conta mais!",
        "Ah, {user}, discordo... por quê?",
      ],
    },
    {
      test: (m) =>
        /\btriste\b|\bchateado\b|\bmal\b|\bhorrível\b|\bp[ée]ssimo\b/i.test(m),
      replies: [
        "Poxa, {user}... o que aconteceu?",
        "Que pena, {user}! Se quiser conversar, estamos aqui.",
        "Melhoras, {user}!",
      ],
    },
    {
      test: (m) =>
        /\bfeliz\b|\balegre\b|\bcontente\b|\b[ôo]timo\b|\bexcelente\b/i.test(m),
      replies: [
        "Que bom, {user}! Fico feliz por você!",
        "Aeee, {user}! Continue assim!",
        "Isso aí, {user}!",
      ],
    },
  ];

  for (const pattern of patterns) {
    if (pattern.test(msg)) {
      const template =
        pattern.replies[Math.floor(Math.random() * pattern.replies.length)];
      return {
        author: pickAuthor(),
        text: template.replace("{user}", user),
      };
    }
  }

  return null;
}

const simulatedMessages: Omit<Message, "id">[] = [
  { author: "Ana", text: "Que legal esse chat!" },
  { author: "Carlos", text: "Bom dia a todos!" },
  { author: "João", text: "Alguém viu o jogo ontem?" },
  { author: "Maria", text: "Sim, foi incrível!" },
  { author: "Ana", text: "Qual o time de vocês?" },
  { author: "Carlos", text: "Sou Flamengo desde criança!" },
  { author: "João", text: "Tô pensando em viajar no fim de ano..." },
  { author: "Maria", text: "Boa ideia! Pra onde?" },
  { author: "Ana", text: "Alguém tem dica de filme?" },
  { author: "Carlos", text: "Vi um filme de ação ontem, muito bom!" },
];

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  typingAuthor: string | null;
  sendMessage: (text: string) => Promise<void>;
}

let simulatedIndex = 0;

export default function useChat(currentUser: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingAuthor, setTypingAuthor] = useState<string | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiClient.get<Message[]>("/messages").then(({ data }) => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (simulatedIndex >= simulatedMessages.length) return;

      const payload = simulatedMessages[simulatedIndex];

      setTypingAuthor(payload.author);

      typingTimer.current = setTimeout(async () => {
        setTypingAuthor(null);

        try {
          const { data } = await apiClient.post<Message>("/messages", payload);
          setMessages((prev) => [...prev, data]);
          simulatedIndex += 1;
        } catch {
          simulatedIndex += 1;
        }
      }, TYPING_DURATION);
    }, SIMULATED_INTERVAL);

    return () => {
      clearInterval(interval);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const { data } = await apiClient.post<Message>("/messages", {
        author: currentUser,
        text,
      });
      setMessages((prev) => [...prev, data]);

      const reply = getReplyFor(text, currentUser);
      if (!reply) return;

      if (replyTimer.current) clearTimeout(replyTimer.current);

      replyTimer.current = setTimeout(async () => {
        setTypingAuthor(reply.author);

        typingTimer.current = setTimeout(async () => {
          setTypingAuthor(null);

          try {
            const { data: replyData } = await apiClient.post<Message>(
              "/messages",
              reply,
            );
            setMessages((prev) => [...prev, replyData]);
          } catch {
            // ignore
          }
        }, TYPING_DURATION);
      }, REPLY_DELAY);
    },
    [currentUser],
  );

  return { messages, loading, typingAuthor, sendMessage };
}
