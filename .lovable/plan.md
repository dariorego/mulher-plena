

## Plano: Criar Usuário Manualmente na Página de Usuários

Adicionar um botão "Criar Usuário" ao lado do "Importar CSV" na página de Usuários, com um dialog para criação manual.

### 1. Edge Function `create-user`

Criar uma edge function que usa o `SUPABASE_SERVICE_ROLE_KEY` para chamar `supabase.auth.admin.createUser()`, pois o client-side não pode criar usuários via admin API. A function receberá `email`, `password`, `name` e `role`.

O trigger `handle_new_user` já existente cuidará de criar automaticamente o registro em `profiles` e `user_roles` (com role padrão 'aluno'). Após a criação, se o role informado for diferente de 'aluno', a function faz um UPDATE no `user_roles`.

### 2. Componente `CreateUserDialog`

Novo componente `src/components/admin/CreateUserDialog.tsx`:
- Dialog com formulário: Nome, Email, Senha, Papel (select com Admin/Tutor/Participante)
- Validação client-side (campos obrigatórios, email válido, senha mínima)
- Chama a edge function via `supabase.functions.invoke('create-user', ...)`
- Callback `onUserCreated` para atualizar a lista

### 3. Integração na Página

- Importar `CreateUserDialog` em `UsersPage.tsx`
- Colocar o botão ao lado do "Importar CSV" no header

### Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/functions/create-user/index.ts` | Criar edge function |
| `src/components/admin/CreateUserDialog.tsx` | Criar componente |
| `src/pages/UsersPage.tsx` | Adicionar botão + dialog |

