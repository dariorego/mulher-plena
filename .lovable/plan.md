
## Configuração de Percentual de Conclusão das Estações

### Objetivo
Criar uma seção de configuração onde administradores podem definir os percentuais de conclusão para cada etapa da estação (Vídeo, Atividade, Material Complementar), e permitir que participantes marquem essas etapas como concluídas.

### Visão Geral do Sistema

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE CONFIGURAÇÃO                        │
│                                                                 │
│  Admin → Configurações → Percentual Conclusão Estações          │
│            │                                                    │
│            ├─→ Vídeo: __% (ex: 40%)                            │
│            ├─→ Atividade: __% (ex: 40%)                        │
│            └─→ Material Complementar: __% (ex: 20%)            │
│                                                                 │
│            [Validação: soma = 100%]                            │
├─────────────────────────────────────────────────────────────────┤
│                    FLUXO DO PARTICIPANTE                        │
│                                                                 │
│  Aluno → Estação → Visualiza seções com checkbox "Concluído"   │
│            │                                                    │
│            ├─→ [✓] Vídeo Assistido (40%)                       │
│            ├─→ [✓] Atividade Enviada (40%)                     │
│            └─→ [ ] Material Complementar (20%)                 │
│                                                                 │
│            Progresso da Estação: 80%                           │
└─────────────────────────────────────────────────────────────────┘
```

### Mudanças Necessárias

#### 1. SettingsContext - Novas Configurações
Adicionar os percentuais de conclusão ao contexto existente.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `videoPercentage` | number | 40 | Percentual do vídeo |
| `activityPercentage` | number | 40 | Percentual da atividade |
| `supplementaryPercentage` | number | 20 | Percentual do material complementar |

#### 2. Página de Configurações - Nova Seção
Adicionar card de "Percentual Conclusão Estações" com inputs numéricos.

- Três campos de entrada para cada etapa
- Validação em tempo real: soma deve ser 100%
- Mensagem de erro se soma ≠ 100%
- Toast de sucesso ao salvar

#### 3. Tabela de Progresso (user_progress) - Nova Estrutura
Estender o uso do `user_progress` para rastrear conclusão de etapas por estação.

| Tipo de Registro | journey_id | station_id | activity_id | Marcação |
|------------------|------------|------------|-------------|----------|
| Vídeo concluído | ✓ | ✓ | "video" | video_completed |
| Atividade concluída | ✓ | ✓ | activity_id | completed |
| Material concluído | ✓ | ✓ | "supplementary" | supplementary_completed |

Alternativa: adicionar campos `video_completed` e `supplementary_completed` diretamente na tabela.

#### 4. StationDetail - Checkboxes de Conclusão
Adicionar checkboxes para marcar cada etapa como concluída.

- Checkbox ao lado do vídeo: "Marcar como assistido"
- Checkbox ao lado da atividade: (já existe via submissão)
- Checkbox ao lado do material complementar: "Marcar como visto"
- Exibir barra de progresso da estação

#### 5. DataContext - Funções de Progresso
Adicionar funções para marcar/desmarcar etapas como concluídas.

| Função | Parâmetros | Descrição |
|--------|------------|-----------|
| `markStationStepComplete` | stationId, step, completed | Marca etapa como concluída |
| `getStationProgress` | userId, stationId | Retorna progresso % da estação |

### Arquivos a Modificar

```text
┌─────────────────────────────────────────────────────────────────┐
│  1. src/contexts/SettingsContext.tsx                            │
│     - Adicionar videoPercentage, activityPercentage,           │
│       supplementaryPercentage na interface                      │
│     - Valores default: 40, 40, 20                              │
│     - Persistir no localStorage                                 │
├─────────────────────────────────────────────────────────────────┤
│  2. src/pages/Settings.tsx                                      │
│     - Novo Card: "Percentual Conclusão Estações"               │
│     - Três inputs numéricos com validação                      │
│     - Indicador visual da soma (verde = 100%, vermelho ≠ 100%)│
│     - Toast ao salvar                                          │
├─────────────────────────────────────────────────────────────────┤
│  3. src/types/index.ts                                          │
│     - Estender UserProgress (opcional) ou criar novo tipo      │
│     - StationStepCompletion para rastrear etapas               │
├─────────────────────────────────────────────────────────────────┤
│  4. src/contexts/DataContext.tsx                                │
│     - Adicionar markStationStepComplete()                      │
│     - Adicionar getStationProgress() considerando percentuais  │
│     - Atualizar getJourneyProgress() para usar nova lógica     │
├─────────────────────────────────────────────────────────────────┤
│  5. src/pages/StationDetail.tsx                                 │
│     - Checkboxes de "Concluído" em cada seção                  │
│     - Barra de progresso da estação                            │
│     - Estado local para marcações                              │
│     - Integração com DataContext                               │
└─────────────────────────────────────────────────────────────────┘
```

### Interface da Página de Configurações

```text
┌────────────────────────────────────────────────────────────────┐
│  Configurações de Avaliação                                    │
│  [Card existente com switches de nota/feedback]                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  📊 Percentual Conclusão Estações                              │
│  ─────────────────────────────────────────                     │
│  Defina o peso de cada etapa no cálculo do progresso           │
│                                                                │
│  🎬 Vídeo                    [___40__] %                       │
│  📝 Atividade                [___40__] %                       │
│  📚 Material Complementar    [___20__] %                       │
│                                                                │
│  ────────────────────────────────────────                      │
│  Total:  ✓ 100%  (verde) ou ✗ 85% (vermelho)                  │
└────────────────────────────────────────────────────────────────┘
```

### Interface do Participante na Estação

```text
┌────────────────────────────────────────────────────────────────┐
│  Progresso da Estação: [████████░░] 80%                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Vídeo Aula                                                    │
│  [Vídeo incorporado]                                           │
│  ☑ Marcar como assistido                                       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Atividade                                                     │
│  [Botão de atividade]                                          │
│  ✓ Atividade enviada (automático via submissão)                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Material Complementar                                         │
│  [Botão de vídeo]                                              │
│  ☐ Marcar como visto                                           │
└────────────────────────────────────────────────────────────────┘
```

### Detalhes Técnicos

**Extensão do SettingsContext:**
```typescript
interface EvaluationSettings {
  showScoreToStudents: boolean;
  showFeedbackToStudents: boolean;
  // Novas configurações
  videoPercentage: number;
  activityPercentage: number;
  supplementaryPercentage: number;
}

const defaultSettings: EvaluationSettings = {
  showScoreToStudents: true,
  showFeedbackToStudents: true,
  videoPercentage: 40,
  activityPercentage: 40,
  supplementaryPercentage: 20,
};
```

**Estrutura de Progresso por Estação:**
```typescript
// Usando user_progress existente com activity_id especial
{
  user_id: "user-123",
  journey_id: "journey-456",
  station_id: "station-789",
  activity_id: "__video__",  // Marcador especial para vídeo
  completed: true,
  completed_at: "2026-02-02T..."
}

{
  user_id: "user-123",
  journey_id: "journey-456",
  station_id: "station-789",
  activity_id: "__supplementary__",  // Marcador para material
  completed: true,
  completed_at: "2026-02-02T..."
}
```

**Cálculo do Progresso da Estação:**
```typescript
const getStationProgress = (userId: string, stationId: string): number => {
  const { videoPercentage, activityPercentage, supplementaryPercentage } = settings;
  
  let total = 0;
  
  // Verifica vídeo
  if (hasVideoCompleted(userId, stationId)) {
    total += videoPercentage;
  }
  
  // Verifica atividade (via submissão)
  if (hasActivitySubmitted(userId, stationId)) {
    total += activityPercentage;
  }
  
  // Verifica material complementar
  if (hasSupplementaryCompleted(userId, stationId)) {
    total += supplementaryPercentage;
  }
  
  return total;
};
```

### Fluxo de Dados

1. **Admin configura percentuais** → Salvo no localStorage via SettingsContext
2. **Participante acessa estação** → Vê checkboxes em cada seção
3. **Participante marca "Concluído"** → Registro salvo em user_progress
4. **Sistema calcula progresso** → Usa percentuais configurados + marcações
5. **Dashboard exibe progresso** → Soma de todas estações da jornada

### Observações
- Os percentuais são globais (aplicam-se a todas as estações)
- Se uma estação não tiver vídeo/atividade/material, seu percentual é redistribuído
- A atividade é marcada automaticamente quando o participante submete
