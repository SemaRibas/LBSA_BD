# LBSA - Laboratorio de Sistematica Animal

<div align="center">

![LBSA Logo](https://img.shields.io/badge/LBSA-Laboratorio%20de%20Sistematica%20Animal-14b8a6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)

</div>

## Visao do Produto

O **LBSA** e um sistema de gerenciamento web desenvolvido especificamente para o Laboratorio de Sistematica Animal da UFSC. O projeto visa digitalizar e organizar os processos de inventario de materiais e gerenciamento de colecoes sistematicas, substituindo planilhas Excel por uma interface moderna, intuitiva e acessivel.

### Objetivos

- **Inventario de Materiais**: Cadastro e acompanhamento de todos os materiais do laboratorio com status, quantidade e observacoes
- **Colecoes Sistematicas**: Gestao completa de especimes biologicos com dados taxonomicos, localidade de coleta e condicao dos frascos
- **Dashboard Analitico**: Visualizacao de metricas e graficos para tomada de decisao
- **Acessibilidade**: Interface responsiva que funciona em desktop, tablet e mobile

---

## Personas

| Persona | Descricao | Necessidades |
|---------|-----------|--------------|
| **Pesquisador** | Professor ou doutorando que utiliza as colecoes para pesquisas | Busca rapida, filtros avancados, exportacao de dados |
| **Estagiario** | Graduando que realiza manutencao e cadastro de materiais | Interface simples, cadastro rapido, orientacoes claras |
| **Coordenador** | Responsavel pelo laboratorio | Visao geral, metricas, relatorios |
| **Visitante** | Pesquisadores externos que acessam as colecoes | Visualizacao limitada, busca publica |

---

## Arquitetura

```
lbsa-app/
├── src/
│   ├── app/                    # Paginas Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Dashboard
│   │   ├── globals.css        # Estilos globais
│   │   ├── insights/
│   │   │   └── page.tsx       # Inventario de materiais
│   │   └── channels/
│   │       └── page.tsx       # Colecoes sistematicas
│   ├── components/
│   │   ├── ui/                # Componentes reutilizaveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── dashboard/         # Componentes do dashboard
│   │       ├── MetricCards.tsx
│   │       ├── ChartCard.tsx
│   │       └── ActivityCard.tsx
│   ├── data/
│   │   └── mock.ts           # Dados mockados
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   └── utils.ts          # Utilitarios
│   └── types/
│       └── index.ts          # Definicoes de tipos
├── public/                    # Assets estaticos
├── tailwind.config.ts         # Configuracao do Tailwind
├── next.config.js             # Configuracao do Next.js
└── package.json               # Dependencias
```

---

## Backlog MVP

### Fase 1 - Estrutura Basica
- [x] Configuracao do projeto com Next.js 14
- [x] Sistema de design com Tailwind CSS
- [x] Componentes UI reutilizaveis
- [x] Layout com Sidebar e Header

### Fase 2 - Funcionalidades Principais
- [x] Dashboard com metricas e graficos
- [x] Pagina de Inventario (CRUD de materiais)
- [x] Pagina de Colecoes (CRUD de especimes)
- [x] Sistema de busca e filtros
- [x] Modais para edicao

### Fase 3 - UX e Polish
- [x] Tema claro/escuro
- [x] Animacoes e transicoes
- [x] Loading states (skeleton)
- [x] Responsividade mobile
- [x] Estados de hover e focus

### Fase 4 - Funcionalidades Avancadas
- [ ] Exportacao para Excel/CSV
- [ ] Importacao de planilhas
- [ ] Autenticacao de usuarios
- [ ] Permissoes de acesso
- [ ] Historico de alteracoes

---

## Roadmap v2

### Q1 2027
- [ ] Integracao com banco de dados (Supabase/PostgreSQL)
- [ ] API REST completa
- [ ] Sistema de autenticacao (NextAuth.js)
- [ ] Upload de fotos dos especimes

### Q2 2027
- [ ] Exportacao de relatorios PDF
- [ ] Dashboard com graficos interativos (Recharts)
- [ ] Sistema de notificacoes
- [ ] Modo offline (PWA)

### Q3 2027
- [ ] Integracao com sistemas de museum (Specify, BraHMO)
- [ ] API publica para consulta de colecoes
- [ ] App mobile nativo (React Native)
- [ ] Sistema de auditoria e logs

---

## Stack Tecnologica

| Camada | Tecnologia | Versao |
|--------|------------|--------|
| **Frontend** | Next.js | 14.2.5 |
| **UI Library** | React | 18.3.1 |
| **Linguagem** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | 3.4.10 |
| **Icones** | Lucide React | 0.441.0 |
| **Utilitarios** | clsx + tailwind-merge | Latest |
| **Fonte** | Inter + Plus Jakarta Sans | Google Fonts |

---

## Pre-requisitos

- Node.js 18+ (recomendado: 20 LTS)
- npm ou yarn ou pnpm

---

## Instrucoes de Setup

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/lbsa-app.git
cd lbsa-app
```

### 2. Instale as dependencias

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Execute o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

### 4. Acesse a aplicacao

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Deploy na Vercel

### Opcao 1: Deploy via Git

1. Faca push do codigo para um repositorio GitHub/GitLab/Bitbucket
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositorio
5. Configure as variaveis de ambiente (se necessario)
6. Clique em "Deploy"

### Opcao 2: Deploy via CLI

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faca login
vercel login

# Deploy
vercel
```

### Variaveis de Ambiente (Opcional)

Crie um arquivo `.env.local`:

```env
# Supabase (opcional - para backend)
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui

# Outras configuracoes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Integracao com Supabase (Opcional - v2)

Para conectar a um banco de dados real:

### 1. Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Crie as tabelas

```sql
-- Tabela de materiais
CREATE TABLE materiais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material VARCHAR(255) NOT NULL,
  quantidade VARCHAR(50),
  estado VARCHAR(50),
  validade VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de colecoes
CREATE TABLE colecoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_tombo VARCHAR(50) UNIQUE NOT NULL,
  identificacao_basica VARCHAR(255),
  clado VARCHAR(100),
  filo VARCHAR(100),
  subfilo VARCHAR(100),
  classe VARCHAR(100),
  determinador VARCHAR(255),
  numero_exemplares VARCHAR(50),
  localidade TEXT,
  coletor VARCHAR(255),
  data_coleta DATE,
  fonte VARCHAR(100),
  condicao_frasco VARCHAR(50),
  observacoes TEXT,
  estagiario_responsavel VARCHAR(255),
  status VARCHAR(50),
  condicao_recipiente VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Instale o cliente Supabase

```bash
npm install @supabase/supabase-js
```

### 4. Configure o cliente

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Estrutura de Cores

| Cor | Uso | Hex |
|-----|-----|-----|
| Teal (Principal) | Sidebar, botoes, acentos | `#0d9488` |
| Superficie | Fundo geral | `#fafafa` |
| Card Branco | Cards e superficies | `#ffffff` |
| Peach | Card de destaque | `#fbd5a5` |
| Verde | Status positivo | `#10b981` |
| Amarelo | Status de alerta | `#f59e0b` |
| Vermelho | Status critico | `#ef4444` |

---

## Componentes UI

### Button
```tsx
<Button variant="primary" size="md">Texto</Button>
<Button variant="secondary" isLoading>Carregando</Button>
<Button variant="ghost" size="sm">Fantasma</Button>
```

### Card
```tsx
<Card variant="default">Basico</Card>
<Card variant="gradient" hover>Gradiente com hover</Card>
<Card variant="accent">Destaque</Card>
```

### Input
```tsx
<Input label="Nome" placeholder="Digite..." icon={<Icon />} />
<Input error="Campo obrigatorio" />
```

### Table
```tsx
<Table data={items} columns={columns} onRowClick={handleClick} />
```

---

## Comandos Uteis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de dev
npm run build        # Gera o build de producao
npm run start        # Inicia o servidor de producao
npm run lint         # Executa o linter

# Limpeza
rm -rf .next node_modules  # Limpa cache
npm install                 # Reinstala dependencias
```

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## Licenca

Este projeto e de uso interno do Laboratorio de Sistematica Animal - UFSC.

---

## Contato

**Laboratorio de Sistematica Animal**
- Universidade Federal de Santa Catarina
- Departamento de Biologia Celular, Embriologia e Genetica

---

<div align="center">

Feito com dedication pelo LBSA

</div>
