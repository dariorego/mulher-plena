

## Plano: Sistema de Mensagens "Fale com a Tutoria"

Canal de comunicação estilo chat entre participantes e tutores/admins, inspirado no Moodle.

---

### 1. Banco de Dados (2 tabelas novas)

**Tabela `conversations`**
- `id` (uuid, PK), `participant_id` (uuid, ref profiles), `subject` (text), `status` ('open' | 'closed'), `last_message_at` (timestamptz), `created_at`, `updated_at`
- RLS: participante vê as próprias; professor/admin vê todas

**Tabela `messages`**
- `id` (uuid, PK), `conversation_id` (uuid, FK conversations), `sender_id` (uuid), `content` (text), `attachment_url` (text, nullable), `is_read` (boolean, default false), `created_at`
- RLS: leitura para participantes da conversa + professor/admin; inserção para participantes da conversa + professor/admin

**Storage bucket**: `message-attachments` (público) para anexos de arquivos.

### 2. Navegação

- **Participante (aluno)**: adicionar item "Fale com a Tutoria" (ícone `MessageCircle`) no menu, rota `/mensagens`
- **Professor**: adicionar item "Mensagens" no menu, rota `/mensagens`
- **Admin**: adicionar "Mensagens" dentro do grupo "Administração", rota `/mensagens`

### 3. Página de Mensagens (`src/pages/MessagesPage.tsx`)

**Visão do Participante:**
- Lista das suas conversas com status (pendente/respondida) e data da última mensagem
- Botão "Nova Conversa" para iniciar um chat com a tutoria (campo assunto + primeira mensagem)
- Ao clicar numa conversa, abre o chat com histórico completo
- Input de mensagem com botão de anexar arquivo
- Indicador de mensagens não lidas (badge no menu)

**Visão do Tutor/Admin:**
- Lista de todas as conversas organizadas por: participante, status, data
- Filtros por status (pendente/respondida) e busca por nome
- Ao abrir uma conversa, visualiza o histórico e pode responder
- Contagem de mensagens não lidas visível na lista

### 4. Componentes

- `ConversationList.tsx` — lista lateral de conversas com badges de não lidas
- `ChatWindow.tsx` — área de chat com histórico, input de mensagem e upload de anexo
- `NewConversationDialog.tsx` — modal para criar nova conversa (assunto + mensagem)

### 5. Notificações e Status

- Badge numérico no item de menu mostrando total de mensagens não lidas
- Conversas com mensagens não lidas destacadas na lista
- Ao abrir uma conversa, mensagens são marcadas como lidas automaticamente
- Realtime via Supabase channels para atualização instantânea de novas mensagens

### 6. Arquivos a Criar/Editar

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar tabelas, bucket, RLS |
| `src/pages/MessagesPage.tsx` | Criar |
| `src/components/messages/ConversationList.tsx` | Criar |
| `src/components/messages/ChatWindow.tsx` | Criar |
| `src/components/messages/NewConversationDialog.tsx` | Criar |
| `src/components/layout/AppLayout.tsx` | Adicionar rota no menu + badge |
| `src/App.tsx` | Adicionar rota `/mensagens` |
| `src/types/index.ts` | Adicionar tipos Conversation e Message |

### Detalhes Técnicos

- Realtime: subscribe no canal `messages` filtrado por `conversation_id` para atualizações em tempo real
- Marcar como lido: `UPDATE messages SET is_read = true WHERE conversation_id = X AND sender_id != auth.uid()`
- Contagem de não lidas via query separada para o badge do menu
- Upload de anexos usa o bucket `message-attachments` com limite de tamanho

