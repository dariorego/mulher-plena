
# Controle de Liberacao de Jornadas pelo Painel Administrativo

## Resumo

Criar um sistema onde o administrador controla quais jornadas estao liberadas para os participantes, mantendo as Jornadas 1, 2 e 3 como pre-requisitos obrigatorios. Exibir mensagens distintas dependendo do motivo do bloqueio.

## Regras de Acesso (nova logica)

1. **Jornadas 1, 2 e 3** (order_index 1-3): sempre acessiveis a todos os participantes
2. **Jornadas 4+**: requerem DUAS condicoes simultaneas:
   - O participante deve ter concluido 100% das Jornadas 1, 2 e 3
   - O administrador deve ter liberado a jornada para aquele participante

## Mensagens de bloqueio

- **Pre-requisitos nao cumpridos**: "As Jornadas 1, 2 e 3 sao pre-requisitos obrigatorios. Complete-as para ter acesso as demais jornadas."
- **Nao liberada pelo admin**: "Esta jornada ainda nao foi liberada. O acesso depende de liberacao ou aquisicao."

## Detalhes Tecnicos

### 1. Nova tabela no Supabase: `journey_access`

Armazena as liberacoes feitas pelo administrador por participante e jornada.

```
Colunas:
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- journey_id (uuid, FK -> journeys)
- granted_by (uuid, FK -> auth.users)
- granted_at (timestamptz, default now())
- UNIQUE(user_id, journey_id)
```

Politicas RLS:
- SELECT: usuarios autenticados podem ver seus proprios registros; admins e professores veem todos
- INSERT/DELETE: somente admins

### 2. Atualizar `DataContext.tsx`

- Buscar dados da tabela `journey_access` no `fetchData`
- Alterar a funcao `isJourneyUnlocked` para verificar as duas condicoes (pre-requisitos + liberacao admin)
- Criar funcao auxiliar `getJourneyLockReason` que retorna o motivo do bloqueio: `'prerequisites'` ou `'not_released'`
- Adicionar funcoes `grantJourneyAccess(userId, journeyId)` e `revokeJourneyAccess(userId, journeyId)` para o admin

### 3. Atualizar `Journeys.tsx`

- Usar `getJourneyLockReason` para exibir a mensagem correta no tooltip de jornadas bloqueadas
- Mensagens diferenciadas conforme o motivo do bloqueio

### 4. Atualizar `JourneyDetail.tsx`

- Alterar a mensagem do toast de redirecionamento para refletir o motivo correto do bloqueio

### 5. Atualizar `Dashboard.tsx`

- Atualizar a mensagem exibida em jornadas bloqueadas para ser contextual

### 6. Criar painel de liberacao na `UsersPage.tsx`

- Adicionar um botao ou secao por usuario para gerenciar o acesso as jornadas
- Ao expandir um usuario, exibir as jornadas 4+ com toggle (switch) para liberar/revogar acesso
- Mostrar quais jornadas ja foram liberadas com indicador visual

### 7. Atualizar tipos em `src/types/index.ts`

- Adicionar interface `JourneyAccess` com os campos da nova tabela

## Fluxo do Administrador

1. Acessa a pagina de Usuarios
2. Localiza o participante
3. Visualiza as jornadas disponiveis para liberacao (4+)
4. Ativa/desativa o acesso com um toggle
5. A alteracao e refletida imediatamente para o participante

## Arquivos modificados

- **Nova migracao SQL**: criacao da tabela `journey_access` com RLS
- `src/types/index.ts`: nova interface `JourneyAccess`
- `src/contexts/DataContext.tsx`: fetch de `journey_access`, logica de `isJourneyUnlocked` e `getJourneyLockReason`, funcoes de grant/revoke
- `src/pages/Journeys.tsx`: mensagens diferenciadas por motivo de bloqueio
- `src/pages/JourneyDetail.tsx`: toast contextual no redirecionamento
- `src/pages/Dashboard.tsx`: mensagem contextual em jornadas bloqueadas
- `src/pages/UsersPage.tsx`: painel de liberacao de jornadas por usuario
