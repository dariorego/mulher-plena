import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NewConversationDialogProps {
  onCreated: () => void;
}

export function NewConversationDialog({ onCreated }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !user) return;
    setLoading(true);
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ participant_id: user.id, subject: subject.trim() })
        .select()
        .single();

      if (convError) throw convError;

      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: message.trim(),
        });

      if (msgError) throw msgError;

      toast({ title: 'Conversa criada com sucesso!' });
      setSubject('');
      setMessage('');
      setOpen(false);
      onCreated();
    } catch (error: any) {
      toast({ title: 'Erro ao criar conversa', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fale com a Tutoria</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Qual o assunto da sua mensagem?"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva sua mensagem..."
              rows={4}
              maxLength={2000}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !subject.trim() || !message.trim()} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
