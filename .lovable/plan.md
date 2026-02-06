
# Plano: Estruturar Usuários com Dados do Supabase

## Objetivo
Substituir os dados fictícios (mock) da página de Usuários por dados reais do banco de dados Supabase, exibindo todos os usuários cadastrados com nome, email, papel (role) e data de cadastro.

---

## Problema Atual
A página `/usuarios` exibe apenas 3 usuários fixos no código. O banco de dados já possui **9 usuários reais** cadastrados nas tabelas `profiles` e `user_roles`.

---

## Alterações Necessárias

### 1. Banco de Dados - Adicionar email na tabela `profiles`

A tabela `profiles` atualmente não armazena o email dos usuários. Precisamos:

- Adicionar coluna `email` na tabela `profiles`
- Atualizar o trigger `handle_new_user` para salvar o email ao criar o perfil
- Preencher os emails dos usuários já existentes a partir da tabela `auth.users`

```sql
-- Adicionar coluna email
ALTER TABLE profiles ADD COLUMN email text;

-- Atualizar emails existentes
UPDATE profiles SET email = au.email
FROM auth.users au WHERE profiles.id = au.id;

-- Atualizar trigger para salvar email em novos cadastros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');
  RETURN NEW;
END;
$$;
```

### 2. `src/pages/UsersPage.tsx` - Reescrever com dados reais

Substituir completamente a página para:

- Buscar usuários de `profiles` via Supabase client
- Buscar roles de `user_roles` via Supabase client
- Combinar os dados (profile + role) no frontend
- Exibir cards de contagem por role (como já existe)
- Exibir lista completa com nome, email, role e data de cadastro
- Adicionar estado de carregamento (loading)
- Adicionar funcionalidade de alterar role do usuário (Select dropdown)

### 3. Funcionalidade de Alterar Role (Admin)

O administrador poderá alterar o papel de qualquer usuário diretamente na lista:

- Um dropdown `Select` ao lado de cada usuário permitirá trocar entre "Aluno", "Professor" e "Administrador"
- A alteração será salva diretamente na tabela `user_roles` via Supabase
- Feedback visual com toast de confirmação

---

## Estrutura da Interface

```text
+---------------------------------------------------+
| Usuarios                                          |
| Gerencie os usuarios da plataforma                |
+---------------------------------------------------+
| [Admins: 1]  [Professores: 0]  [Alunos: 8]       |
+---------------------------------------------------+
| Lista de Usuarios                                 |
|                                                   |
| [icon] Administrador                              |
|        admin@test.com                              |
|        Cadastro: 17/12/2025                        |
|                              [Administrador v]     |
|                                                   |
| [icon] Dario Nascimento                           |
|        dario@email.com                             |
|        Cadastro: 17/12/2025                        |
|                              [Aluno v]             |
|                                                   |
| ... (demais usuarios)                             |
+---------------------------------------------------+
```

---

## Detalhes Tecnicos

### Consultas ao Supabase

```typescript
// Buscar todos os perfis
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at');

// Buscar todas as roles (admin tem permissao via RLS)
const { data: roles } = await supabase
  .from('user_roles')
  .select('*');

// Atualizar role de um usuario
const { error } = await supabase
  .from('user_roles')
  .update({ role: newRole })
  .eq('user_id', userId);
```

### Politicas RLS Existentes (ja configuradas)

| Tabela | Politica | Contexto |
|--------|----------|----------|
| profiles | SELECT por usuarios autenticados | Permite admin ver todos |
| user_roles | SELECT para admins | Permite listar todas as roles |
| user_roles | ALL para admins | Permite alterar roles |

Nenhuma alteracao de RLS e necessaria - as politicas existentes ja suportam todas as operacoes.

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Adicionar coluna `email` em profiles + atualizar trigger |
| `src/pages/UsersPage.tsx` | Reescrever | Buscar dados reais do Supabase com loading, contagem e alteracao de role |

---

## Resultado Esperado

- A pagina de Usuarios mostrara todos os 9 usuarios reais cadastrados
- Cada usuario exibira: nome, email, role e data de cadastro
- Os cards de contagem refletirao os numeros reais por role
- O admin podera alterar a role de qualquer usuario com um dropdown
- Novos usuarios cadastrados aparecerao automaticamente na lista
