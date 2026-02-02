
# Calendário de Agendamento de Atividades

## Objetivo
Criar um sistema de calendário para agendar encontros/atividades com título, descrição, data/hora, duração e link de acesso (Meet/Teams). O calendário estará disponível no menu de Administração para gestão e no Dashboard dos participantes para visualização.

---

## Estrutura da Solução

### 1. Banco de Dados - Nova Tabela `scheduled_events`

```sql
CREATE TABLE public.scheduled_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    meeting_link TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.scheduled_events ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar eventos
CREATE POLICY "Anyone can view events" ON public.scheduled_events
FOR SELECT TO authenticated USING (true);

-- Apenas admins podem criar/editar/deletar
CREATE POLICY "Admins can manage events" ON public.scheduled_events
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
```

---

### 2. Arquivos a Serem Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/CalendarPage.tsx` | Página de gerenciamento do calendário (admin) |
| `src/components/calendar/EventCalendar.tsx` | Componente de visualização do calendário |
| `src/components/calendar/EventForm.tsx` | Formulário para criar/editar eventos |
| `src/components/calendar/EventCard.tsx` | Card de exibição de evento individual |
| `src/components/calendar/UpcomingEvents.tsx` | Widget de próximos eventos para o Dashboard |

---

### 3. Modificações em Arquivos Existentes

**`src/components/layout/AppLayout.tsx`**
- Adicionar link "Calendário" no menu Administração (para admins)
- Ícone: `Calendar` do lucide-react

**`src/pages/Dashboard.tsx`**
- Adicionar seção "Próximos Eventos" no painel de Visão Geral para participantes

**`src/App.tsx`**
- Adicionar rota `/calendario` protegida

**`src/contexts/DataContext.tsx`**
- Adicionar estado e operações CRUD para eventos agendados

**`src/types/index.ts`**
- Adicionar interface `ScheduledEvent`

---

### 4. Interface do Usuário

**Para Administradores (Página `/calendario`):**
- Visualização em calendário mensal com dias que possuem eventos destacados
- Lista de eventos do mês/semana selecionada
- Botão "Novo Evento" para adicionar
- Ações de editar e excluir em cada evento

**Para Participantes (Dashboard):**
- Card "Próximos Eventos" mostrando os próximos 3-5 eventos
- Cada evento exibe: título, data/hora, duração e botão para acessar o link do Meet/Teams

---

### 5. Formulário de Evento

Campos do formulário:
- **Título** (obrigatório): texto, máximo 100 caracteres
- **Descrição** (opcional): textarea, máximo 500 caracteres  
- **Data e Hora** (obrigatório): DatePicker + TimePicker
- **Duração** (obrigatório): select com opções (30min, 1h, 1h30, 2h, etc.)
- **Link de Acesso** (opcional): URL para Google Meet, Microsoft Teams ou outro

---

## Detalhes Técnicos

### Tipo TypeScript
```typescript
export interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  duration_minutes: number;
  meeting_link?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
```

### Fluxo de Dados
1. DataContext carrega eventos do Supabase na inicialização
2. Operações CRUD atualizam estado local e sincronizam com banco
3. Dashboard filtra eventos futuros ordenados por data
4. Calendário admin permite gestão completa

### Componente Calendar
- Utiliza o componente `Calendar` existente do shadcn/ui (react-day-picker)
- Destaca dias com eventos programados
- Ao clicar em um dia, mostra lista de eventos daquele dia

---

## Ordem de Implementação

1. Criar migração SQL para tabela `scheduled_events`
2. Adicionar tipo `ScheduledEvent` em `src/types/index.ts`
3. Atualizar `DataContext` com estado e operações de eventos
4. Criar componentes do calendário
5. Criar página `CalendarPage.tsx`
6. Adicionar rota em `App.tsx`
7. Adicionar link no menu de navegação
8. Adicionar widget de eventos no Dashboard
