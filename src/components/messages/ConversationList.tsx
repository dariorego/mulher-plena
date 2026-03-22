import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export interface ConversationItem {
  id: string;
  subject: string;
  status: string;
  last_message_at: string;
  created_at: string;
  participant_id: string;
  participant_name?: string;
  unread_count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  showParticipantName?: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, showParticipantName }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = conversations.filter(c => {
    const matchesSearch = !search ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.participant_name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2 border-b">
        <Input
          placeholder="Buscar conversa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="closed">Fechadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma conversa encontrada
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'w-full text-left p-3 border-b hover:bg-accent/50 transition-colors',
                selectedId === conv.id && 'bg-accent',
                conv.unread_count > 0 && 'font-semibold'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {showParticipantName && conv.participant_name && (
                    <p className="text-xs text-primary truncate">{conv.participant_name}</p>
                  )}
                  <p className="text-sm truncate">{conv.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(conv.last_message_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {conv.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs h-5 min-w-[20px] flex items-center justify-center">
                      {conv.unread_count}
                    </Badge>
                  )}
                  <Badge variant={conv.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                    {conv.status === 'open' ? 'Aberta' : 'Fechada'}
                  </Badge>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
