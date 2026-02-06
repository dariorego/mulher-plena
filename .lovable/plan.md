
# Plano: Sistema de Logs de Atividades e Acessos

## Objetivo
Criar um sistema completo de auditoria que registre, de forma detalhada, todos os acessos e ações realizados por alunos e professores na plataforma, permitindo rastreabilidade completa da navegacao.

---

## Estrutura do Banco de Dados

### Nova Tabela: `user_activity_logs`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico (PK) |
| user_id | uuid | ID do usuario que realizou a acao |
| action | text | Tipo da acao (login, view_journey, view_station, submit_activity, etc.) |
| resource_type | text | Tipo do recurso (platform, journey, station, activity, file) |
| resource_id | uuid | ID do recurso acessado (opcional) |
| journey_id | uuid | Jornada vinculada (opcional) |
| station_id | uuid | Estacao vinculada (opcional) |
| activity_id | uuid | Atividade vinculada (opcional) |
| metadata | jsonb | Dados adicionais em formato livre (titulo, tipo, detalhes) |
| created_at | timestamp | Data e hora do registro |

### Tipos de Acoes Registradas

| Acao | Descricao | resource_type |
|------|-----------|---------------|
| `login` | Usuario fez login na plataforma | platform |
| `logout` | Usuario fez logout | platform |
| `view_dashboard` | Acesso ao dashboard | platform |
| `view_journey` | Acessou uma jornada | journey |
| `view_station` | Acessou uma estacao | station |
| `view_activity` | Acessou uma atividade | activity |
| `submit_activity` | Enviou resposta de uma atividade | activity |
| `mark_video_complete` | Marcou video como assistido | station |
| `mark_podcast_complete` | Marcou podcast como ouvido | station |
| `mark_supplementary_complete` | Marcou material complementar | station |
| `upload_file` | Fez upload de arquivo | activity |
| `create_support_ticket` | Criou ticket de suporte | platform |

### Politicas RLS

- Usuarios podem inserir seus proprios logs (INSERT com user_id = auth.uid())
- Admins podem visualizar todos os logs (SELECT com has_role('admin'))
- Usuarios podem ver seus proprios logs (SELECT com user_id = auth.uid())
- Ninguem pode atualizar ou deletar logs (imutabilidade)

---

## Arquivos a Criar

### 1. `src/hooks/useActivityLogger.ts`
Hook centralizado para registrar logs. Todas as paginas usarao esse hook para inserir registros na tabela.

```text
Funcoes expostas:
- logAction(action, resourceType, options?) -> registra a acao no banco
  options: { resourceId, journeyId, stationId, activityId, metadata }
```

O hook usara o usuario logado do AuthContext para preencher automaticamente o user_id.

### 2. `src/pages/ActivityLogsPage.tsx`
Pagina de visualizacao de logs para administradores com:
- Tabela com todos os registros de log
- Filtros por: usuario, tipo de acao, jornada, estacao, periodo (data inicio/fim)
- Informacoes detalhadas: usuario, acao, recurso, jornada, estacao, data/hora
- Paginacao para grandes volumes de dados
- Exportacao visual com totais e resumos

---

## Arquivos a Modificar

### 1. `src/pages/Login.tsx`
Registrar log de `login` apos autenticacao bem-sucedida.

### 2. `src/contexts/AuthContext.tsx`
Registrar log de `logout` na funcao de saida.

### 3. `src/pages/Dashboard.tsx`
Registrar log de `view_dashboard` ao acessar o painel.

### 4. `src/pages/JourneyDetail.tsx`
Registrar log de `view_journey` ao abrir a pagina de uma jornada.

### 5. `src/pages/StationDetail.tsx`
- Registrar log de `view_station` ao abrir uma estacao
- Registrar log de `mark_video_complete`, `mark_podcast_complete`, `mark_supplementary_complete` ao marcar checkboxes

### 6. `src/pages/ActivityPage.tsx`
- Registrar log de `view_activity` ao abrir uma atividade
- Registrar log de `submit_activity` ao enviar respostas
- Registrar log de `upload_file` ao fazer upload de arquivo

### 7. `src/pages/SupportPage.tsx`
Registrar log de `create_support_ticket` ao criar ticket de suporte.

### 8. `src/components/layout/AppLayout.tsx`
Adicionar "Logs" no menu de administracao.

### 9. `src/App.tsx`
Adicionar rota `/logs` para a pagina de logs.

---

## Interface do Administrador - Pagina de Logs

```text
+-----------------------------------------------------------+
| Logs de Atividade                                         |
| Historico de acessos e acoes na plataforma                |
+-----------------------------------------------------------+
| Filtros:                                                  |
| [Usuario v] [Acao v] [Jornada v] [De: __] [Ate: __]      |
|                                          [Filtrar] [Limpar]|
+-----------------------------------------------------------+
| Usuario       | Acao              | Recurso    | Jornada   |
|               |                   |            | > Estacao |
|               |                   |            |           |
| Data/Hora     |                   |            |           |
+---------------+-------------------+------------+-----------+
| Joao Silva    | Acessou Estacao   | Estacao 2  | Jornada 1 |
| 06/02/2026    |                   |            | > Est. 2  |
| 14:32         |                   |            |           |
+---------------+-------------------+------------+-----------+
| Maria Lima    | Enviou Atividade  | Quiz 1     | Jornada 1 |
| 06/02/2026    |                   |            | > Est. 1  |
| 13:15         |                   |            |           |
+---------------+-------------------+------------+-----------+
| Pedro Santos  | Fez Login         | Plataforma | -         |
| 06/02/2026    |                   |            |           |
| 10:00         |                   |            |           |
+---------------+-------------------+------------+-----------+
|              [< Anterior]  Pag 1 de 5  [Proximo >]        |
+-----------------------------------------------------------+
```

---

## Migracao SQL

```sql
CREATE TABLE user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL DEFAULT 'platform',
  resource_id uuid,
  journey_id uuid,
  station_id uuid,
  activity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indice para consultas por usuario
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);

-- Indice para consultas por data
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Indice para consultas por acao
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);

-- Habilitar RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Usuarios podem inserir seus proprios logs
CREATE POLICY "Users can insert own logs"
  ON user_activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all logs"
  ON user_activity_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Usuarios podem ver seus proprios logs
CREATE POLICY "Users can view own logs"
  ON user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Tabela `user_activity_logs` com indices e RLS |
| `src/hooks/useActivityLogger.ts` | Criar | Hook centralizado para registrar logs |
| `src/pages/ActivityLogsPage.tsx` | Criar | Pagina de visualizacao de logs (admin) |
| `src/pages/Login.tsx` | Modificar | Registrar log de login |
| `src/contexts/AuthContext.tsx` | Modificar | Registrar log de logout |
| `src/pages/Dashboard.tsx` | Modificar | Registrar log de acesso ao dashboard |
| `src/pages/JourneyDetail.tsx` | Modificar | Registrar log de acesso a jornada |
| `src/pages/StationDetail.tsx` | Modificar | Registrar logs de acesso e interacoes |
| `src/pages/ActivityPage.tsx` | Modificar | Registrar logs de acesso e submissao |
| `src/pages/SupportPage.tsx` | Modificar | Registrar log de criacao de ticket |
| `src/components/layout/AppLayout.tsx` | Modificar | Adicionar "Logs" no menu admin |
| `src/App.tsx` | Modificar | Adicionar rota /logs |

---

## Detalhes de Implementacao

### Hook `useActivityLogger`
- Usa o `supabase` client diretamente para INSERT na tabela `user_activity_logs`
- Obtem o `user` do `useAuth()` para preencher o `user_id` automaticamente
- Funcao `logAction` e assincrona mas nao bloqueia a interface (fire-and-forget)
- Erros de log sao silenciosos (console.error) para nao impactar a experiencia do usuario

### Pagina de Logs (Admin)
- Busca dados diretamente do Supabase com paginacao (50 registros por pagina)
- Faz JOIN com `profiles` para exibir nome do usuario
- Faz JOIN com `journeys`, `stations` e `activities` para exibir nomes dos recursos
- Filtros aplicados via query parameters do Supabase
- Labels em portugues para cada tipo de acao

### Pontos de Integracao
Cada pagina recebera chamadas discretas ao `logAction` nos momentos adequados:

1. **Login.tsx**: apos `login()` retornar sem erro
2. **AuthContext.tsx**: antes de chamar `signOut()`
3. **Dashboard.tsx**: em um `useEffect` ao montar a pagina
4. **JourneyDetail.tsx**: em um `useEffect` quando a jornada e carregada
5. **StationDetail.tsx**: em um `useEffect` ao montar + nos handlers de checkbox
6. **ActivityPage.tsx**: em um `useEffect` ao montar + no `handleSubmit`
7. **SupportPage.tsx**: apos criar o ticket com sucesso
