

## Funcionalidade "Esqueci a Senha"

### O que ja temos
O Supabase Auth possui suporte nativo para redefinicao de senha. Nao e necessario criar tabelas, edge functions ou configuracoes extras. Basta usar dois metodos do SDK:
- `resetPasswordForEmail(email)` - envia o email com link de redefinicao
- `updateUser({ password })` - atualiza a senha apos o usuario clicar no link

### O que sera implementado

**1. Link "Esqueci minha senha" na tela de Login**
- Adicionar um link abaixo do campo de senha em `src/pages/Login.tsx`
- O link levara para uma nova pagina `/recuperar-senha`

**2. Nova pagina de solicitacao de recuperacao (`src/pages/ForgotPassword.tsx`)**
- Campo de email
- Botao "Enviar link de recuperacao"
- Chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/redefinir-senha' })`
- Exibe mensagem de confirmacao apos envio

**3. Nova pagina de redefinicao de senha (`src/pages/ResetPassword.tsx`)**
- Dois campos: nova senha e confirmacao de senha
- Validacao de senha minima (6 caracteres) e correspondencia entre campos
- Chama `supabase.auth.updateUser({ password: novaSenha })`
- Redireciona para `/login` apos sucesso

**4. Rota no App.tsx**
- Adicionar rotas `/recuperar-senha` e `/redefinir-senha` como rotas publicas (sem ProtectedRoute)

### Detalhes Tecnicos

**Arquivos novos:**
- `src/pages/ForgotPassword.tsx`
- `src/pages/ResetPassword.tsx`

**Arquivos editados:**
- `src/pages/Login.tsx` - adicionar link "Esqueci minha senha"
- `src/App.tsx` - adicionar as duas novas rotas

**Fluxo do usuario:**
1. Na tela de login, clica em "Esqueci minha senha"
2. Digita o email e clica em enviar
3. Recebe email do Supabase com link de redefinicao
4. Clica no link, e redirecionado para `/redefinir-senha`
5. Define a nova senha e confirma
6. Redirecionado para `/login` com mensagem de sucesso

**Nao requer migracoes de banco nem configuracao extra no Supabase.**

