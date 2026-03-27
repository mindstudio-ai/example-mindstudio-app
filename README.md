# Todo List Agent — MindStudio App

A to-do list manager with two interfaces: a web UI for direct CRUD and a conversational AI agent that manages todos through natural language.

## What it does

**Web UI** (`/`) — Add, complete, and delete todos. Each todo can have AI-generated notes with context and suggestions.

**Agent Chat** (`/chat`) — Talk to an AI assistant that manages your todo list. It can create, update, complete, and delete todos on your behalf, adding helpful notes for complex tasks.

## Structure

```
mindstudio.json              <- manifest
src/
  app.md                     <- spec (what the app does)
  interfaces/
    @brand/                  <- design tokens (colors, typography, voice)
    agent.md                 <- agent personality and behavior spec
    web.md                   <- web interface spec
dist/
  methods/
    src/
      createTodo.ts          <- create a todo with optional AI notes
      listTodos.ts           <- list todos, optionally filter by status
      updateTodo.ts          <- update title or notes
      toggleTodo.ts          <- flip completed status
      deleteTodo.ts          <- delete by ID
      tables/todos.ts        <- todos table definition
    .scenarios/
      sampleTodos.ts         <- seed data for development
  interfaces/
    web/                     <- React frontend (Vite + CSS Modules)
      src/
        App.tsx              <- todo list UI (/, default route)
        Chat.tsx             <- agent chat UI (/chat)
        api.ts               <- SDK clients (createClient + createAgentChatClient)
    agent/                   <- agent config (compiled from src/interfaces/agent.md)
      agent.json             <- model, tools, system prompt path
      system.md              <- compiled system prompt
      tools/                 <- rich tool descriptions (one per method)
```

## Stack

- **Backend:** TypeScript methods using `@mindstudio-ai/agent` for database access
- **Frontend:** React 19 + Vite + CSS Modules + SWR + wouter
- **SDK:** `@mindstudio-ai/interface` for method RPC (`createClient`) and agent chat (`createAgentChatClient`)
- **Agent:** Claude 4.5 Haiku with access to all five methods as tools
- **Database:** Managed by the platform, defined as TypeScript interfaces

## Developing

Edit files in `dist/` — changes take effect immediately. The platform transpiles methods per-request and the frontend uses Vite HMR.

```bash
cd dist/interfaces/web
npm install
npm run dev
```

- `http://localhost:5173/` — todo list
- `http://localhost:5173/chat` — agent chat

## Deploying

```bash
git push origin main
```

The platform builds and deploys automatically.
