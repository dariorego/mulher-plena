import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface ChatWindowProps {
  conversationId: string;
  conversationSubject: string;
  conversationStatus: string;
  onStatusChange?: () => void;
  onMessageSent?: () => void;
}

export function ChatWindow({ conversationId, conversationSubject, conversationStatus, onStatusChange, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const upsertMessage = (message: Message) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === message.id);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...message };
        return next;
      }

      return [...prev, message].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const senderIds = [...new Set((data || []).map((m) => m.sender_id))];
    const { data: profiles } = senderIds.length
      ? await supabase
          .from('profiles')
          .select('id, name')
          .in('id', senderIds)
      : { data: [] as Array<{ id: string; name: string }> };

    const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));
    const enriched = (data || []).map((m) => ({
      ...m,
      sender_name: profileMap.get(m.sender_id) || 'Usuário',
    }));

    setMessages(enriched);
    setLoading(false);

    if (user) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newMsg.sender_id)
            .single();

          upsertMessage({
            ...newMsg,
            sender_name: profile?.name || (newMsg.sender_id === user?.id ? user?.name : 'Usuário'),
          });
          onMessageSent?.();

          if (user && newMsg.sender_id !== user.id) {
            await supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !file) || !user) return;
    setSending(true);

    try {
      let attachmentUrl: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const filePath = `${conversationId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(filePath);
        attachmentUrl = urlData.publicUrl;
      }

      const messageContent = newMessage.trim() || (file ? `📎 ${file.name}` : '');
      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          attachment_url: attachmentUrl,
        })
        .select('*')
        .single();

      if (error) throw error;

      upsertMessage({
        ...insertedMessage,
        sender_name: user.name,
      });

      await supabase
        .from('conversations')
        .update({ last_message_at: insertedMessage.created_at })
        .eq('id', conversationId);

      setNewMessage('');
      setFile(null);
      onMessageSent?.();
    } catch (error: any) {
      toast({ title: 'Erro ao enviar mensagem', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleStatus = async () => {
    const newStatus = conversationStatus === 'open' ? 'closed' : 'open';
    await supabase
      .from('conversations')
      .update({ status: newStatus })
      .eq('id', conversationId);
    onStatusChange?.();
  };

  const isClosed = conversationStatus === 'closed';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{conversationSubject}</h3>
          <Badge variant={isClosed ? 'secondary' : 'default'} className="text-xs mt-1">
            {isClosed ? 'Fechada' : 'Aberta'}
          </Badge>
        </div>
        {user?.role !== 'aluno' && (
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {isClosed ? 'Reabrir' : 'Fechar'}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground text-sm">Carregando...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">Nenhuma mensagem ainda</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[75%] rounded-lg p-3 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}>
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-80">{msg.sender_name}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.attachment_url && (
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-1 mt-2 text-xs underline',
                        isOwn ? 'text-primary-foreground/80' : 'text-primary'
                      )}
                    >
                      <Download className="h-3 w-3" />
                      Anexo
                    </a>
                  )}
                  <p className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                    {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isClosed && (
        <div className="p-3 border-t space-y-2">
          {file && (
            <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
              <Paperclip className="h-3 w-3" />
              <span className="truncate flex-1">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua mensagem..."
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={sending || (!newMessage.trim() && !file)}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
