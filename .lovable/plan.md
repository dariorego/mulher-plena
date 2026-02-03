
# Plano: Adicionar Podcast ao Cálculo de Progresso e Exibir Percentual por Estação

## Resumo
Adicionar o **Podcast** como quarta etapa de conclusão (junto com Vídeo, Atividade e Material Complementar) e exibir a **barra de progresso individual de cada Estação** nos cards da página de Jornada.

---

## O que será implementado

### 1. Exibir Progresso de Cada Estação na Página da Jornada
Na página `JourneyDetail`, cada card de estação (visão do aluno) passará a mostrar uma barra de progresso com o percentual concluído daquela estação específica.

**Visual proposto:**
```text
┌─────────────────────────┐
│ [Imagem da Estação]     │
│     #1                  │
├─────────────────────────┤
│ 2 atividades            │
│ ▓▓▓▓▓▓▓░░░░░░░░░ 45%   │
└─────────────────────────┘
```

### 2. Adicionar Podcast ao Sistema de Progresso
O áudio/podcast que já existe nas estações passará a contribuir para o percentual de conclusão.

**Novo cálculo de progresso:**
- Vídeo: X%
- Atividade: Y%
- Material Complementar: Z%
- **Podcast: W%** (novo)
- Total: 100%

### 3. Atualizar Configurações
A página de Configurações receberá um novo campo para definir o percentual do Podcast.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/SettingsContext.tsx` | Adicionar `podcastPercentage` |
| `src/pages/Settings.tsx` | Adicionar input para configurar % do Podcast |
| `src/contexts/DataContext.tsx` | Incluir podcast no cálculo de `getStationProgress` e `isStepCompleted` |
| `src/pages/StationDetail.tsx` | Adicionar checkbox "Marcar podcast como ouvido" e exibir +X% |
| `src/pages/JourneyDetail.tsx` | Exibir barra de progresso em cada card de estação |

---

## Detalhes Técnicos

### SettingsContext.tsx
Adicionar nova propriedade ao contexto:
- `podcastPercentage: number` (valor padrão: 10)
- Ajustar valores padrões para somar 100 (ex: 35+35+20+10=100)

### DataContext.tsx
Modificar as funções:
- `isStepCompleted`: aceitar `'podcast'` como step válido
- `getStationProgress`: verificar se `station.audio_url` existe e se foi marcado como concluído
- `markStationStepComplete`: permitir marcar podcast como concluído

### StationDetail.tsx
Na seção de Áudio (já existente), adicionar:
- Checkbox similar ao do vídeo e material complementar
- Mostrar `+X%` quando marcado
- Fundo verde quando concluído

### JourneyDetail.tsx
Nos cards de estação (visão aluno):
- Importar `getStationProgress` do DataContext
- Adicionar componente `<Progress>` abaixo da contagem de atividades
- Mostrar percentual em texto

---

## Valores Padrão Propostos
Para manter compatibilidade, os novos valores padrão serão:
- Vídeo: 35%
- Atividade: 35%
- Material Complementar: 20%
- Podcast: 10%

Esses valores serão configuráveis na página de Configurações.

---

## Fluxo do Usuário Atualizado
1. Usuário acessa uma Jornada
2. Vê todas as Estações com suas respectivas barras de progresso
3. Clica em uma Estação
4. Assiste o vídeo → marca checkbox → +35%
5. Ouve o podcast → marca checkbox → +10%
6. Faz a atividade → enviada automaticamente → +35%
7. Assiste material complementar → marca checkbox → +20%
8. Estação 100% → confetes e parabéns!
