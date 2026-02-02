
## Eventos por Jornada ou Gerais

Adicionar a capacidade de vincular eventos a uma jornada específica ou deixá-los como eventos gerais.

### Comportamento

| Tipo de Evento | Onde Aparece |
|----------------|--------------|
| **Geral** (sem jornada) | Dashboard (Visão Geral) |
| **Vinculado a Jornada** | Página da Jornada (Visão Geral) |

---

### Alterações Necessárias

#### 1. Banco de Dados

Adicionar coluna `journey_id` na tabela `scheduled_events`:

```sql
ALTER TABLE public.scheduled_events 
ADD COLUMN journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL;
```

#### 2. Tipo TypeScript

**Arquivo:** `src/types/index.ts`

Adicionar `journey_id` na interface `ScheduledEvent`:

```typescript
export interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  duration_minutes: number;
  meeting_link?: string;
  journey_id?: string;  // NOVO - null = evento geral
  created_by?: string;
  created_at: string;
  updated_at: string;
}
```

#### 3. Formulário de Evento

**Arquivo:** `src/components/calendar/EventForm.tsx`

- Adicionar campo Select para escolher a jornada
- Opções: "Geral (para todos)" + lista de jornadas disponíveis
- Receber `journeys` como prop

#### 4. Página do Calendário (Admin)

**Arquivo:** `src/pages/CalendarPage.tsx`

- Passar lista de jornadas para o `EventForm`
- Exibir indicador visual no `EventCard` quando evento é vinculado a uma jornada

#### 5. Dashboard

**Arquivo:** `src/pages/Dashboard.tsx`

- Filtrar apenas eventos gerais (`journey_id === null ou undefined`)

```typescript
const generalEvents = scheduledEvents.filter(e => !e.journey_id);
```

#### 6. Página da Jornada

**Arquivo:** `src/pages/JourneyDetail.tsx`

- Adicionar widget `UpcomingEvents` no card "Visão Geral"
- Filtrar apenas eventos da jornada atual

```typescript
const journeyEvents = scheduledEvents.filter(e => e.journey_id === journey.id);
```

#### 7. Componente EventCard (Opcional)

**Arquivo:** `src/components/calendar/EventCard.tsx`

- Exibir badge/tag indicando a jornada vinculada quando aplicável

---

### Fluxo Visual

```text
+---------------------------+
|      Formulário Evento    |
+---------------------------+
| Título: [_______________] |
| Jornada: [Geral (todos) v]|
|          [Jornada 1      ]|
|          [Jornada 2      ]|
| Data/Hora: [___] [___]    |
| ...                       |
+---------------------------+

Dashboard (Aluno)           Página da Jornada
+-----------------------+   +-----------------------+
| Próximos Eventos      |   | Visão Geral           |
| (apenas gerais)       |   | - Estações: 5         |
|                       |   | - Progresso: 40%      |
| [Evento Geral 1]      |   |                       |
| [Evento Geral 2]      |   | Próximos Eventos      |
+-----------------------+   | (desta jornada)       |
                            | [Evento Jornada 1]    |
                            +-----------------------+
```

---

### Ordem de Implementação

1. Atualizar tipo `ScheduledEvent` com `journey_id`
2. Modificar `EventForm` para incluir seletor de jornada
3. Atualizar `CalendarPage` para passar jornadas ao formulário
4. Atualizar `EventCard` para exibir jornada vinculada
5. Filtrar eventos gerais no Dashboard
6. Adicionar widget de eventos na página da Jornada
7. Executar SQL para adicionar coluna no banco
