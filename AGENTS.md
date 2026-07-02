# AGENTS.md

## Visão Geral

Mini Chat — aplicação React 19 + TypeScript + Vite 8 com três abas: chat grupo simulado, árvore Pokémon e chat IA. Deploy via Cloudflare Pages.

## Comandos

```bash
npm install          # instalar dependências
npm run dev          # servidor dev (porta 5173)
npm run build        # build produção → dist/
npm run lint         # oxlint
npm run typecheck    # tsc --noEmit (strict mode)
```

## Stack

- React 19, TypeScript 6 (strict), Vite 8
- Styled Components v6 (CSS-in-JS, transient props com `$prefix`)
- Axios + axios-mock-adapter (mock de APIs)
- dotenv (carregar `.env` no `vite.config.ts`)

## API Key (OpenRouter)

A chave `OPENROUTER_API_KEY` NUNCA vai pro bundle. Fluxo:

- **Dev**: `vite.config.ts` carrega `.env` via `dotenv.config()`, proxy injeta header `Authorization`
- **Prod**: `functions/api/chat.ts` (Pages Function) lê `context.env.OPENROUTER_API_KEY`

O frontend chama `POST /api/chat` sem auth. O proxy/função adiciona o header e redireciona ao OpenRouter.

Para testar a aba IA localmente: `cp .env.example .env` e preencha a chave.

## Convenções de Código

- **Componentes**: compound component pattern (`Chat.Header`, `Chat.Messages`, `Chat.Input`)
- **Estado**: hooks nativos (`useState`, `useEffect`, `useCallback`, `useContext`, `useRef`)
- **Estilização**: Styled Components com transient props (`$prop`) para não vazar para o DOM
- **Tipos**: interfaces explícitas em arquivos dedicados ou co-localizadas
- **Commits**: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`)
- **Sem comentários** no código a menos que estritamente necessário

## Estrutura

```
src/
├── api/           # clientes HTTP + mocks + tipos
├── components/    # componentes React
│   ├── Chat/      # compound component do chat grupo
│   ├── WizardChat/ # árvore Pokémon
│   ├── AgentChat/  # chat IA
│   └── MessageItem.tsx
├── hooks/         # useChat, useAgentChat
├── App.tsx         # root + 3 abas
└── main.tsx        # entry point + setupMocks()

functions/
└── api/chat.ts    # Cloudflare Pages Function
```

## Mock API

O módulo `src/api/mocks.ts` usa `axios-mock-adapter` com 300ms de delay. Intercepta GET/POST em `/messages`. Os dados são mantidos em memória (resetam ao recarregar a página). O hook `useChat` gerencia setInterval (5s) que simula mensagens de outros usuários.

## PokéAPI

`src/api/pokemon.ts` faz fetch na `https://pokeapi.co/api/v2`. Filtra Pokémon por tipo e altura (campo `height` em decímetros). IDs ≤ 1025 para excluir mega evoluções e formas alternativas.

## Deploy

Cloudflare Pages detecta automaticamente a pasta `functions/` e o build do Vite. Configuração padrão: build command `npm run build`, output `dist`. A env var `OPENROUTER_API_KEY` deve ser adicionada no dashboard.
