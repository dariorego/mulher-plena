
# Plano: Sistema de Suporte para Reportar Melhorias e Bugs

## Visão Geral
Criar um sistema completo de suporte onde todos os usuários (alunos, professores e admins) podem reportar bugs ou sugerir melhorias. O sistema registra automaticamente o nome do usuário logado, data/hora, título e descrição. Administradores poderão responder e atualizar o status das solicitações.

---

## Estrutura do Banco de Dados

### Nova Tabela: `support_tickets`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único (PK) |
| user_id | uuid | ID do usuário que criou o ticket |
| title | text | Título da solicitação |
| description | text | Descrição detalhada |
| type | enum | Tipo: 'bug' ou 'improvement' |
| status | enum | Status: 'open', 'in_progress', 'resolved', 'closed' |
| response | text | Resposta da equipe de suporte |
| responded_by | uuid | ID do admin que respondeu |
| responded_at | timestamp | Data/hora da resposta |
| created_at | timestamp | Data/hora de criação |
| updated_at | timestamp | Data/hora da última atualização |

### Enums Necessários
```sql
-- Tipo de ticket
CREATE TYPE support_ticket_type AS ENUM ('bug', 'improvement');

-- Status do ticket
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
```

### Políticas RLS
- Todos usuários autenticados podem criar tickets (INSERT com user_id = auth.uid())
- Usuários podem ver seus próprios tickets (SELECT com user_id = auth.uid())
- Admins podem ver todos os tickets (SELECT com has_role('admin'))
- Admins podem atualizar qualquer ticket (UPDATE com has_role('admin'))
- Usuários podem atualizar seus próprios tickets não resolvidos (UPDATE limitado)

---

## Arquivos a Criar

### 1. `src/pages/SupportPage.tsx`
Página principal de suporte com:
- Formulário para criar novo ticket (todos os usuários)
- Lista de tickets do usuário (para alunos/professores)
- Lista de todos os tickets com filtros (para admin)
- Diálogo para responder/atualizar status (para admin)

### 2. `src/types/index.ts` (Atualização)
Adicionar interface `SupportTicket`:
```typescript
export type SupportTicketType = 'bug' | 'improvement';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  response?: string;
  responded_by?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Dados unidos
  user_name?: string;
}
```

---

## Arquivos a Modificar

### 1. `src/components/layout/AppLayout.tsx`
Adicionar "Suporte" no menu de navegação para todos os perfis:

```typescript
// Para aluno (linha 60-64):
aluno: [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jornadas', label: 'Jornadas', icon: BookOpen },
  { path: '/conquistas', label: 'Conquistas', icon: Trophy },
  { path: '/suporte', label: 'Suporte', icon: HelpCircle }, // NOVO
],

// Para professor (linha 65-69):
professor: [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jornadas', label: 'Jornadas', icon: BookOpen },
  { path: '/avaliacoes', label: 'Avaliações', icon: ClipboardCheck },
  { path: '/suporte', label: 'Suporte', icon: HelpCircle }, // NOVO
],

// Para admin - adicionar no grupo "Administração" (linha 85-90):
{
  label: 'Administração',
  icon: Settings,
  items: [
    { path: '/usuarios', label: 'Usuários', icon: Users },
    { path: '/calendario', label: 'Calendário', icon: Calendar },
    { path: '/imagens', label: 'Repositório de Imagens', icon: ImageIcon },
    { path: '/suporte', label: 'Suporte', icon: HelpCircle }, // NOVO
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ],
},
```

### 2. `src/App.tsx`
Adicionar rota para a página de Suporte:
```typescript
import SupportPage from "./pages/SupportPage";

// Na lista de rotas:
<Route path="/suporte" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
```

### 3. `src/contexts/DataContext.tsx`
Adicionar operações CRUD para tickets de suporte:
- `supportTickets: SupportTicket[]` no estado
- `addSupportTicket()` - criar novo ticket
- `updateSupportTicket()` - atualizar ticket (admin)
- Buscar tickets no `fetchData()`

---

## Interface do Usuário

### Visão para Alunos e Professores
```text
┌─────────────────────────────────────────────────────────┐
│ 🛟 Suporte                                              │
│ Reporte problemas ou sugira melhorias                   │
├─────────────────────────────────────────────────────────┤
│ [+ Novo Ticket]                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🐛 Bug: Erro ao carregar vídeo     [Aberto]         │ │
│ │ Criado em: 05/02/2026 14:30                         │ │
│ │ O vídeo da estação 2 não carrega...                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💡 Melhoria: Modo escuro           [Resolvido]      │ │
│ │ Criado em: 01/02/2026 10:15                         │ │
│ │ Seria bom ter um modo escuro...                     │ │
│ │ ─────────────────────────────────────               │ │
│ │ 📝 Resposta: Implementamos o modo escuro!           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Visão para Administradores
```text
┌─────────────────────────────────────────────────────────┐
│ 🛟 Suporte - Gestão de Tickets                          │
│ Gerencie as solicitações dos usuários                   │
├─────────────────────────────────────────────────────────┤
│ Filtros: [Todos▾] [Bugs▾] [Melhorias▾] [Status▾]        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🐛 Erro ao carregar vídeo          [Aberto]         │ │
│ │ Por: João Silva | 05/02/2026 14:30                  │ │
│ │ O vídeo da estação 2 não carrega...                 │ │
│ │                                    [Responder 📝]   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Formulário Novo Ticket
```text
┌─────────────────────────────────────────────────────────┐
│ Novo Ticket de Suporte                                  │
├─────────────────────────────────────────────────────────┤
│ Tipo de solicitação:                                    │
│ ○ 🐛 Reportar Bug                                       │
│ ○ 💡 Sugerir Melhoria                                   │
│                                                         │
│ Título: _______________________________________         │
│                                                         │
│ Descrição:                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│           [Cancelar]  [Enviar Ticket]                   │
└─────────────────────────────────────────────────────────┘
```

---

## Migração SQL Completa

```sql
-- Criar enum para tipo de ticket
CREATE TYPE support_ticket_type AS ENUM ('bug', 'improvement');

-- Criar enum para status do ticket
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Criar tabela de tickets de suporte
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type support_ticket_type NOT NULL DEFAULT 'bug',
  status support_ticket_status NOT NULL DEFAULT 'open',
  response text,
  responded_by uuid,
  responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver seus próprios tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins podem ver todos os tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Usuários autenticados podem criar tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem atualizar qualquer ticket
CREATE POLICY "Admins can update tickets"
  ON support_tickets
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Usuários podem excluir seus próprios tickets não respondidos
CREATE POLICY "Users can delete own unanswered tickets"
  ON support_tickets
  FOR DELETE
  USING (auth.uid() = user_id AND response IS NULL);
```

---

## Resumo das Alterações

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| Nova migração SQL | Criar | Tabela `support_tickets` com RLS |
| `src/types/index.ts` | Modificar | Adicionar tipos SupportTicket |
| `src/pages/SupportPage.tsx` | Criar | Página completa de suporte |
| `src/components/layout/AppLayout.tsx` | Modificar | Adicionar "Suporte" ao menu |
| `src/App.tsx` | Modificar | Adicionar rota /suporte |
| `src/contexts/DataContext.tsx` | Modificar | Adicionar CRUD de tickets |

---

## Funcionalidades Detalhadas

### Para Todos os Usuários
- Criar novo ticket com título, descrição e tipo (bug/melhoria)
- Visualizar lista dos próprios tickets
- Ver status atualizado e respostas da equipe
- Excluir tickets próprios não respondidos

### Para Administradores
- Visualizar todos os tickets de todos os usuários
- Filtrar por tipo (bug/melhoria) e status
- Responder aos tickets
- Alterar status (aberto, em andamento, resolvido, fechado)
- Ver informações do usuário que criou o ticket
