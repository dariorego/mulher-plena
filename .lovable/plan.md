

## Plano: Toggle de Recompensas (Ativo/Inativo) nas Configurações

Adicionar um toggle na página de Configurações para ativar/desativar o sistema de recompensas (Conquistas). Quando inativo, o menu "Conquistas" e a rota serão ocultados.

### 1. Migração — Adicionar coluna `rewards_enabled` na tabela `system_settings`

```sql
ALTER TABLE system_settings ADD COLUMN rewards_enabled boolean NOT NULL DEFAULT true;
```

### 2. SettingsContext — Adicionar campo `rewardsEnabled`

- Adicionar `rewardsEnabled: boolean` à interface `EvaluationSettings`
- Mapear `rewardsEnabled` ↔ `rewards_enabled` no `toDbRow` e `fromDbRow`
- Default: `true`

### 3. Página de Configurações — Novo card com toggle

Adicionar um card "Recompensas / Conquistas" com um `Switch` para ativar/desativar, similar aos toggles de nota/feedback já existentes.

### 4. AppLayout — Ocultar menu "Conquistas" quando inativo

- Importar `useSettings` no `AppLayout`
- Filtrar o item `{ path: '/conquistas' }` do menu do aluno quando `rewardsEnabled === false`

### 5. Rota `/conquistas` — Redirecionar quando inativo

Na página `Achievements.tsx`, verificar `rewardsEnabled` e redirecionar para `/dashboard` se estiver desativado.

### Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/` | Nova migração: coluna `rewards_enabled` |
| `src/contexts/SettingsContext.tsx` | Adicionar campo `rewardsEnabled` |
| `src/pages/Settings.tsx` | Novo card com toggle |
| `src/components/layout/AppLayout.tsx` | Filtrar menu condicionalmente |
| `src/pages/Achievements.tsx` | Redirect quando desativado |

