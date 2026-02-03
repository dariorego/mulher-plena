
# Plano: Adicionar Funcionalidade de Excluir Posts do Fórum na Página de Avaliações

## Problema Identificado
Os posts do fórum são armazenados em uma tabela separada chamada `forum_posts`, diferente das outras atividades que usam `activity_submissions`. Quando se exclui submissões na página de Avaliações, os posts do fórum permanecem intactos.

## Situação Atual
| Tipo de Atividade | Tabela de Dados | Excluído ao Limpar? |
|-------------------|-----------------|---------------------|
| Quiz, Essay, Upload, Gamificada | activity_submissions | Sim |
| Fórum Colaborativo | forum_posts | Não |

## Solução Proposta
Adicionar uma seção ou funcionalidade na área administrativa para gerenciar/excluir posts do fórum.

### Opção 1: Botão de Excluir no Próprio Post (já existe para o autor)
O componente `ForumBoard.tsx` já permite que o **próprio autor** exclua seus posts (linha 286-294). Porém, admins/professores não conseguem excluir posts de outros usuários.

### Opção 2: Permitir que Admins/Professores Excluam Qualquer Post
Modificar a lógica do `ForumBoard.tsx` para permitir que admins e professores também vejam e usem o botão de excluir em qualquer post.

## Alterações Propostas

### 1. Atualizar RLS no Supabase (já pode existir, mas confirmar)
Garantir que admins e professores possam excluir posts do fórum.

**Arquivo**: Nova migration SQL
```sql
CREATE POLICY "Admins and professors can delete any forum post"
ON public.forum_posts
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);
```

### 2. Modificar ForumBoard.tsx
Alterar a condição de exibição do botão de excluir para incluir admins e professores.

**Arquivo**: `src/components/activities/ForumBoard.tsx`

```typescript
// De:
{user?.id === post.user_id && (

// Para:
{(user?.id === post.user_id || user?.role === 'admin' || user?.role === 'professor') && (
```

## Arquivos a Modificar
1. `supabase/migrations/` - Nova migration para política RLS
2. `src/components/activities/ForumBoard.tsx` - Permitir admins/professores excluírem posts

## Fluxo do Usuário Atualizado
1. Admin/Professor acessa a atividade de Fórum
2. Vê todos os posts no mural
3. Passa o mouse sobre qualquer post → botão de lixeira aparece
4. Clica na lixeira → post é excluído
5. Toast de confirmação: "Post excluído"

## Detalhes Técnicos

### Modificação no ForumBoard.tsx
Na linha 286, alterar a condição:

```typescript
// Antes
{user?.id === post.user_id && (
  <button
    onClick={() => handleDelete(post)}
    ...
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
)}

// Depois
{(user?.id === post.user_id || user?.role === 'admin' || user?.role === 'professor') && (
  <button
    onClick={() => handleDelete(post)}
    ...
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
)}
```

### Nova Migration SQL
```sql
-- Permitir que admins e professores excluam qualquer post do fórum
CREATE POLICY "Admins and professors can delete any forum post"
ON public.forum_posts
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);
```

## Benefícios
- Admins e professores podem moderar o fórum
- Mantém a consistência com a lógica de exclusão de submissões
- Usuários ainda podem excluir seus próprios posts
