
## Percentuais de Conclusao Independentes por Estacao

### Objetivo
Transformar os percentuais de conclusao de globais para por estacao, onde cada estacao pode ter sua propria configuracao. A configuracao atual em Settings sera mantida como valores padrao para novas estacoes.

### Situacao Atual
- Percentuais sao globais (40% video, 40% atividade, 20% material complementar)
- Configurados em `/configuracoes` via `SettingsContext`
- Todas as estacoes usam os mesmos valores

### Nova Arquitetura

```text
+-------------------------------------------------------------------+
|                    FLUXO DE CONFIGURACAO                          |
|                                                                   |
|  Settings (Padroes Globais)                                       |
|    |                                                              |
|    +-> Novos defaults para estacoes criadas                       |
|                                                                   |
|  Edicao de Estacao                                                |
|    |                                                              |
|    +-> Secao: "Percentual de Conclusao"                          |
|         - Video: ___% (se tiver video_url)                       |
|         - Atividade: ___% (se tiver atividades)                  |
|         - Material Complementar: ___% (se tiver supplementary)   |
|         - Total: 100% (validacao)                                |
+-------------------------------------------------------------------+
```

### Mudancas no Banco de Dados

Adicionar 3 novas colunas na tabela `stations`:

| Coluna | Tipo | Default | Descricao |
|--------|------|---------|-----------|
| `video_percentage` | integer | null | Percentual do video |
| `activity_percentage` | integer | null | Percentual da atividade |
| `supplementary_percentage` | integer | null | Percentual do material |

Quando os valores forem `null`, o sistema usara os valores globais do `SettingsContext`.

### Arquivos a Modificar

**1. Migracao SQL**
- Criar nova migracao para adicionar colunas na tabela `stations`

**2. `src/integrations/supabase/types.ts`**
- Regenerar automaticamente apos migracao (ou atualizar manualmente)

**3. `src/types/index.ts`**
- Adicionar campos opcionais na interface `Station`:
```typescript
interface Station {
  // campos existentes...
  video_percentage?: number;
  activity_percentage?: number;
  supplementary_percentage?: number;
}
```

**4. `src/components/admin/StationForm.tsx`**
- Adicionar nova secao "Percentual de Conclusao da Estacao"
- Exibir campos apenas para etapas disponiveis (video/atividade/material)
- Validacao: soma deve ser 100%
- Usar valores do Settings como defaults iniciais

**5. `src/contexts/DataContext.tsx`**
- Atualizar `getStationProgress()` para usar percentuais da estacao
- Fallback para valores globais quando estacao nao tiver configuracao

**6. `src/pages/StationDetail.tsx`**
- Exibir percentuais especificos da estacao (em vez dos globais)

**7. `src/pages/Settings.tsx`**
- Manter configuracao atual como "Valores Padrao"
- Adicionar nova secao: "Composicao por Estacao" com lista de todas estacoes e suas configuracoes

### Interface no Formulario de Estacao

```text
+-------------------------------------------------------------------+
|  Percentual de Conclusao                                          |
|  Defina o peso de cada etapa desta estacao                        |
|                                                                   |
|  [!] Apenas etapas configuradas aparecem                          |
|                                                                   |
|  Video Aula                    [___40__] %                       |
|  (mostrado apenas se video_url preenchido)                        |
|                                                                   |
|  Atividade                     [___40__] %                       |
|  (mostrado apenas se existem atividades)                          |
|                                                                   |
|  Material Complementar         [___20__] %                       |
|  (mostrado apenas se supplementary_url preenchido)                |
|                                                                   |
|  ---------------------------------------------------------------  |
|  Total: [check] 100%  Configuracao valida                         |
+-------------------------------------------------------------------+
```

### Interface em Configuracoes - Nova Secao

```text
+-------------------------------------------------------------------+
|  Composicao por Estacao                                           |
|  Visualize e edite os percentuais de cada estacao                 |
|                                                                   |
|  [Jornada 1: Introducao]                                          |
|  +---------------------------------------------------------------+|
|  | Estacao 1: Boas Vindas                                        ||
|  | Video: 50% | Atividade: 50% | Material: - (nao tem)           ||
|  | [Editar]                                                      ||
|  +---------------------------------------------------------------+|
|  | Estacao 2: Primeiros Passos                                   ||
|  | Video: 40% | Atividade: 40% | Material: 20%                   ||
|  | [Editar]                                                      ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  [Jornada 2: Aprofundamento]                                      |
|  +---------------------------------------------------------------+|
|  | Estacao 1: Conceitos                                          ||
|  | Video: 60% | Atividade: - (nao tem) | Material: 40%           ||
|  | [Editar]                                                      ||
|  +---------------------------------------------------------------+|
+-------------------------------------------------------------------+
```

### Logica de Calculo de Progresso

```typescript
const getStationProgress = (userId: string, stationId: string): number => {
  const station = stations.find(s => s.id === stationId);
  
  // Usar percentuais da estacao ou fallback para globais
  const videoPct = station?.video_percentage ?? videoPercentage;
  const activityPct = station?.activity_percentage ?? activityPercentage;
  const supplementaryPct = station?.supplementary_percentage ?? supplementaryPercentage;
  
  let total = 0;
  let maxPossible = 0;
  
  if (station?.video_url) {
    maxPossible += videoPct;
    if (isStepCompleted(userId, stationId, 'video')) total += videoPct;
  }
  
  if (hasActivities(stationId)) {
    maxPossible += activityPct;
    if (isStepCompleted(userId, stationId, 'activity')) total += activityPct;
  }
  
  if (station?.supplementary_url) {
    maxPossible += supplementaryPct;
    if (isStepCompleted(userId, stationId, 'supplementary')) total += supplementaryPct;
  }
  
  return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
};
```

### Comportamento Especial

1. **Estacoes sem alguma etapa**: Se uma estacao nao tem video, a entrada de video nao aparece no formulario, e seu percentual e redistribuido automaticamente

2. **Redistribuicao automatica**: Quando admin preenche o formulario, apenas os campos de etapas disponiveis aparecem, garantindo que a soma seja 100% apenas entre as etapas existentes

3. **Compatibilidade**: Estacoes existentes sem configuracao de percentual usarao os valores globais

### Sequencia de Implementacao

1. Criar migracao SQL para adicionar colunas
2. Atualizar tipos TypeScript
3. Modificar StationForm para incluir secao de percentuais
4. Atualizar DataContext para usar percentuais da estacao
5. Atualizar StationDetail para exibir percentuais corretos
6. Adicionar secao de visualizacao em Settings

### Observacoes
- A migracao SQL e simples (apenas ALTER TABLE ADD COLUMN)
- Os valores null indicam "usar padrao global"
- A interface se adapta dinamicamente ao conteudo da estacao
