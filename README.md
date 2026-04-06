# DeepStudy

Uma aplicação web para organizar sessões de estudo e controlar revisões com a técnica de Spaced Repetition.

**Live**: https://deepstudy-silk.vercel.app

## O que é

DeepStudy ajuda você a:
- Criar sessões de estudo com contexto (assunto, tópico, dificuldade)
- Visualizar revisões agendadas para hoje
- Marcar quando você revisou algo
- Organizar suas revisões em abas (Todas, Hoje, Pendentes, Concluídas)

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: CSS Modules
- **Backend**: Node.js + Express + Prisma + SQLite (em desenvolvimento)
- **Autenticação**: JWT

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm

### Frontend

```bash
cd DEEPSTUDY-FRONTEND
npm install
npm run dev
```

Frontend rodará em `http://localhost:5173`

### Backend

```bash
cd DEEPSTUDY-BACKEND
npm install
npm run dev
```

Backend rodará em `http://localhost:3000`

### Environment

Crie um arquivo `.env` na raiz do frontend:

```
VITE_API_URL=http://localhost:3000
```

## Credenciais de teste

Email: `rodrigo@example.com`
Senha: `123456`

## Estrutura do Projeto

```
DEEPSTUDY-FRONTEND/
├── src/
│   ├── pages/          # Componentes de página
│   ├── components/     # Componentes reutilizáveis
│   ├── hooks/          # Lógica de estado (useReviews, useAuth)
│   ├── services/       # Chamadas pra API
│   ├── contexts/       # Context API
│   ├── types/          # Interfaces TypeScript
│   └── utils/          # Funções auxiliares
├── public/             # Assets estáticos
└── index.html

DEEPSTUDY-BACKEND/
├── src/
│   ├── controllers/    # Handlers de requisições
│   ├── services/       # Lógica de negócio
│   ├── routes/         # Endpoints
│   ├── middleware/     # Autenticação, tratamento de erro
│   └── utils/          # Helpers
├── prisma/
│   ├── schema.prisma   # Schema do BD
│   ├── migrations/     # Migrations do banco
│   └── seed.js         # Seed de dados
└── src/server.js
```

## Features Implementadas

- Autenticação (Login/Registro)
- Criar sessões de estudo
- Ver revisões de hoje
- Marcar revisões como concluídas
- Filtrar revisões por status
- Dashboard com contadores
- Responsivo


## Deploy

O frontend está deployado na **Vercel**: https://deepstudy-silk.vercel.app

Cada push pra main faz deploy automático.