# Mini Chat

Aplicação de chat com três abas — conversa em grupo simulada, árvore de decisão Pokémon via PokéAPI e chat com IA via OpenRouter. Construída como teste técnico para a vaga na Montree.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript (strict mode) |
| Build | Vite 8 |
| Estilização | Styled Components v6 |
| HTTP | Axios + axios-mock-adapter |
| Linter | oxlint |
| Deploy | Cloudflare Pages |

## Funcionalidades

### Chat em Grupo Simulado
- 3 mensagens iniciais carregadas via mock de API (300ms de latência simulada)
- Envio de mensagens com `POST /messages`
- Simulação de mensagens em tempo real de outros usuários a cada 5 segundos
- Indicador "está digitando..." com 2 segundos de antecedência
- Rolagem automática para a mensagem mais recente
- Mensagens de "Você" alinhadas à direita (verde), outros usuários à esquerda (azul)

### Árvore de Decisão Pokémon
- Chat conversacional estilo WhatsApp para escolher um Pokémon
- Passo 1: escolha do tipo (18 tipos coloridos)
- Passo 2: filtro por altura (pequeno/médio/grande)
- Passo 3: grid de Pokémon filtrados da PokéAPI com sprites oficiais
- Pokémon escolhido salvo em `localStorage` e exibido como badge

### Chat com IA (OpenRouter)
- Aba separada com conversa livre com um modelo LLM
- Chave da API nunca exposta ao frontend (proxy seguro)
- Mensagens de erro contextuais (401, 429, 500, rede)
- Sistema de prompt configurável

## Arquitetura

```
Browser                     Proxy / Function              API Externa
  │                              │                              │
  │  POST /api/chat              │                              │
  │  { model, messages }        │                              │
  │─────────────────────────────►│                              │
  │                              │  POST /v1/chat/completions   │
  │                              │  Authorization: Bearer $KEY │
  │                              │─────────────────────────────►│
  │                              │◄─────────────────────────────│
  │◄─────────────────────────────│                              │
```

A chave `OPENROUTER_API_KEY` existe apenas no servidor:
- **Dev local**: proxy do Vite injeta `Authorization` no header
- **Produção**: Cloudflare Pages Function (`functions/api/chat.ts`) lê `context.env.OPENROUTER_API_KEY`

## Instalação e Execução

```bash
# Instalar dependências
npm install

# (Opcional) Configurar chat com IA
cp .env.example .env
# Edite .env com sua chave OpenRouter: OPENROUTER_API_KEY=sk-or-v1-...
# A aba IA funciona sem chave, mas exibirá erro ao enviar mensagens

# Rodar localmente
npm run dev
```

Acesse `http://localhost:5173`.

## Scripts

| Comando         | Descrição                        |
|-----------------|----------------------------------|
| `npm run dev`   | Servidor de desenvolvimento      |
| `npm run build` | Build de produção para `dist/`   |
| `npm run preview` | Preview local do build         |
| `npm run lint`  | Linter (oxlint)                  |
| `npm run typecheck` | Verificação de tipos (tsc)  |

## Deploy no Cloudflare Pages

1. Conecte o repositório GitHub
2. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Adicione a variável de ambiente no dashboard:
   - `OPENROUTER_API_KEY` = `sk-or-v1-...`
4. Deploy automático a cada push

## Estrutura do Projeto

```
src/
├── api/
│   ├── client.ts          # Axios base para mock API
│   ├── mocks.ts           # Mock adapter + dados simulados
│   ├── types.ts           # Interfaces Message / SendMessagePayload
│   ├── pokemon.ts         # Cliente PokéAPI (tipos, detalhes)
│   └── openrouter.ts      # Cliente da IA (POST /api/chat)
├── components/
│   ├── Chat/              # Chat composto (compound component)
│   │   ├── context.ts     # React Context + hook useChatContext
│   │   ├── Chat.tsx       # Provider + container
│   │   ├── ChatHeader.tsx # Cabeçalho
│   │   ├── ChatMessages.tsx # Lista + auto-scroll + typing
│   │   └── ChatInput.tsx  # Campo de texto + botão enviar
│   ├── MessageItem.tsx    # Bolha de mensagem individual
│   ├── WizardChat/        # Árvore de decisão Pokémon
│   │   └── WizardChat.tsx # Chat WhatsApp-style com passos
│   └── AgentChat/         # Chat com IA
│       └── AgentChat.tsx  # UI + estado da conversa
├── hooks/
│   ├── useChat.ts         # Hook do chat em grupo simulado
│   └── useAgentChat.ts    # Hook do chat com IA
├── App.tsx                # App raiz: login + 3 abas
├── main.tsx               # Entry point + setup dos mocks
└── index.css              # Reset CSS global

functions/
└── api/
    └── chat.ts            # Cloudflare Pages Function (proxy seguro)
```

## Pontos Técnicos

- **Compound Component Pattern**: `Chat.Header`, `Chat.Messages`, `Chat.Input`
- **Hooks nativos**: `useState`, `useEffect`, `useCallback`, `useContext`, `useRef`
- **Limpeza de efeitos**: intervalos e timeouts limpos no cleanup do `useEffect`
- **Persistência**: nome de usuário e Pokémon escolhido em `localStorage`
- **Responsivo**: full-screen em mobile (≤640px), centralizado com `max-width: 800px` em desktop
- **Sem exposição de secrets**: chave da API isolada no proxy/functions, nunca no bundle
- **Conventional commits**: histórico semântico com `feat:`, `refactor:`, `chore:`, `fix:`
