import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConversationList, ConversationItem } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isStudent = user?.role === 'aluno';

  const fetchConversations = async () => {
    if (!user) return;

    const { data: convs, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Get participant names
    const participantIds = [...new Set((convs || []).map(c => c.participant_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', participantIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p.name]));

    // Get unread counts per conversation
    const { data: unreadData } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('is_read', false)
      .neq('sender_id', user.id);

    const unreadMap = new Map<string, number>();
    (unreadData || []).forEach(m => {
      const count = unreadMap.get(m.conversation_id) || 0;
      unreadMap.set(m.conversation_id, count + 1);
    });

    const enriched: ConversationItem[] = (convs || []).map(c => ({
      id: c.id,
      subject: c.subject,
      status: c.status,
      last_message_at: c.last_message_at,
      created_at: c.created_at,
      participant_id: c.participant_id,
      participant_name: profileMap.get(c.participant_id) || 'Participante',
      unread_count: unreadMap.get(c.id) || 0,
    }));

    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const selected = conversations.find(c => c.id === selectedId);

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          {isStudent ? 'Fale com a Tutoria' : 'Mensagens'}
        </h1>
        {isStudent && <NewConversationDialog onCreated={fetchConversations} />}
      </div>

      <div className="border rounded-lg bg-card flex h-[calc(100vh-220px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r flex-shrink-0 hidden md:flex flex-col">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showParticipantName={!isStudent}
            />
          )}
        </div>

        {/* Mobile list or chat */}
        <div className="flex-1 flex flex-col md:hidden">
          {selectedId && selected ? (
            <div className="flex flex-col h-full">
              <button
                onClick={() => setSelectedId(undefined)}
                className="p-2 text-sm text-primary border-b text-left"
              >
                ← Voltar
              </button>
              <ChatWindow
                conversationId={selected.id}
                conversationSubject={selected.subject}
                conversationStatus={selected.status}
                onStatusChange={fetchConversations}
              />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showParticipantName={!isStudent}
            />
          )}
        </div>

        {/* Desktop chat */}
        <div className="flex-1 hidden md:flex flex-col">
          {selectedId && selected ? (
            <ChatWindow
              conversationId={selected.id}
              conversationSubject={selected.subject}
              conversationStatus={selected.status}
              onStatusChange={fetchConversations}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Selecione uma conversa para visualizar
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
