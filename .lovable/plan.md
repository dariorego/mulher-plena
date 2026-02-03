
# Plano: Remover Título da Estação para Participantes

## Objetivo
Ocultar o título das estações em todas as visualizações para participantes (alunos e professores), mantendo a identidade visual baseada nas capas/imagens.

---

## Locais a Modificar

### 1. ActivityPage.tsx (linha 254)
**Situação atual**: Exibe `{journey?.title} • {station.title}`
**Alteração**: Remover a parte `• {station.title}`, mantendo apenas o título da jornada

```typescript
// De:
{journey?.title} • {station.title}

// Para:
{journey?.title}
```

### 2. Dashboard.tsx (linha 273)
**Situação atual**: Exibe `{journey.title} > {station.title}` na seção de submissões recentes (admin/professor)
**Alteração**: Remover a parte `> {station.title}`, mantendo apenas o título da jornada

```typescript
// De:
{journey.title} &gt; {station.title}

// Para:
{journey.title}
```

---

## Arquivos Já Corretos (Não Precisam de Alteração)

| Arquivo | Status |
|---------|--------|
| StationDetail.tsx | Título já oculto para alunos/professores (linha 192-195) |
| JourneyDetail.tsx | Cards de estação não exibem título para alunos/professores |
| StationCard.tsx | Componente administrativo - título deve aparecer para gerenciamento |
| Evaluations.tsx | Dropdown de filtro para admin - título necessário para seleção |

---

## Resumo das Alterações

| Arquivo | Linha | Ação |
|---------|-------|------|
| `src/pages/ActivityPage.tsx` | 254 | Remover `• {station.title}` |
| `src/pages/Dashboard.tsx` | 273 | Remover `> {station.title}` |

---

## Resultado Esperado
- Na página de atividade: apenas o nome da jornada será exibido
- No dashboard (submissões recentes): apenas o nome da jornada será exibido
- Manter consistência com a regra de ocultar títulos de estações para participantes
