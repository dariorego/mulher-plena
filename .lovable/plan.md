
# Solicitacao de Exclusao de Atividade e Visualizacao Pos-Envio

## Resumo

Atualmente, as respostas ja ficam visiveis para o aluno apos o envio (isso ja funciona). O que precisa ser implementado e um sistema de **solicitacao de exclusao** onde o aluno pede para refazer a atividade, e o admin/professor aprova ou rejeita.

## O que ja funciona

- As respostas enviadas ja ficam visiveis na pagina da atividade (ActivityPage.tsx) -- cada tipo de atividade tem sua propria visualizacao pos-envio
- Admins/professores ja podem excluir submissoes diretamente pela pagina de Avaliacoes

## O que sera implementado

### 1. Nova tabela no banco de dados: `deletion_requests`

Campos:
- `id` (uuid, PK)
- `submission_id` (uuid, FK para activity_submissions)
- `user_id` (uuid, FK para auth.users)
- `reason` (text) -- motivo da solicitacao
- `status` (enum: 'pending', 'approved', 'rejected')
- `reviewed_by` (uuid, nullable)
- `reviewed_at` (timestamp, nullable)
- `created_at` (timestamp)

Politicas RLS:
- Alunos podem criar solicitacoes para suas proprias submissoes
- Alunos podem ver suas proprias solicitacoes
- Admins/professores podem ver e atualizar todas as solicitacoes

### 2. Botao "Solicitar Exclusao" na visualizacao do aluno

Em cada bloco de atividade ja enviada (dentro de `ActivityPage.tsx`), sera adicionado um botao "Solicitar Refazer Atividade" que:
- Abre um dialog pedindo o motivo
- Cria um registro na tabela `deletion_requests` com status 'pending'
- Exibe um indicador visual quando ja existe uma solicitacao pendente
- Desabilita o botao se ja houver solicitacao pendente

### 3. Painel de solicitacoes para Admin/Professor

Na pagina de Avaliacoes (`Evaluations.tsx`), sera adicionada uma nova aba ou secao para gerenciar solicitacoes de exclusao:
- Lista de solicitacoes pendentes com informacoes do participante, atividade e motivo
- Botoes para Aprovar (exclui a submissao e atualiza o status) ou Rejeitar
- Ao aprovar, a submissao e deletada automaticamente, liberando o aluno para reenviar

### 4. Integracao com DataContext

- Nova funcao `createDeletionRequest(submissionId, reason)` 
- Nova funcao `reviewDeletionRequest(requestId, status)` que, ao aprovar, tambem exclui a submissao
- Novo estado para armazenar as solicitacoes

---

## Detalhes Tecnicos

### Migracao SQL

```text
-- Enum para status
CREATE TYPE deletion_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Tabela
CREATE TABLE deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES activity_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status deletion_request_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Alunos criam solicitacoes proprias
CREATE POLICY "Users can create own deletion requests"
  ON deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Alunos veem suas solicitacoes
CREATE POLICY "Users can view own deletion requests"
  ON deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins/profs veem todas
CREATE POLICY "Admins and professors can view all requests"
  ON deletion_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'professor'));

-- Admins/profs atualizam
CREATE POLICY "Admins and professors can update requests"
  ON deletion_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'professor'));
```

### Arquivos modificados

1. **`src/types/index.ts`** -- Novo tipo `DeletionRequest`
2. **`src/contexts/DataContext.tsx`** -- Fetch, create e review de solicitacoes
3. **`src/pages/ActivityPage.tsx`** -- Botao "Solicitar Refazer" em cada bloco de atividade ja enviada (para alunos)
4. **`src/pages/Evaluations.tsx`** -- Secao/aba de solicitacoes pendentes com acoes de aprovar/rejeitar

### Fluxo do usuario

```text
Aluno envia atividade
       |
       v
Aluno visualiza resposta na pagina da atividade
       |
       v
Aluno clica "Solicitar Refazer Atividade"
       |
       v
Dialog pede motivo -> Cria solicitacao (status: pending)
       |
       v
Admin/Professor ve solicitacao na pagina de Avaliacoes
       |
       +---> Aprovar: exclui submissao, aluno pode reenviar
       |
       +---> Rejeitar: aluno ve que foi rejeitado
```
