import { useState, useEffect, useRef, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Bug, Lightbulb, MessageSquare, Trash2, Clock, CheckCircle2, Circle, Loader2, Paperclip, X, Image, FileText, ExternalLink, MapPin, Route } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SupportTicketType = 'bug' | 'improvement';
type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  response?: string;
  responded_by?: string;
  responded_at?: string;
  attachment_url?: string;
  journey_id?: string;
  station_id?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  journey_title?: string;
  station_title?: string;
}

const statusLabels: Record<SupportTicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const statusColors: Record<SupportTicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-muted text-muted-foreground',
};

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { journeys, stations } = useData();
  const { logAction } = useActivityLogger();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Filters (admin only)
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form states
  const [newTicket, setNewTicket] = useState({
    type: 'bug' as SupportTicketType,
    title: '',
    description: '',
    journey_id: '',
    station_id: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Response form (admin)
  const [responseForm, setResponseForm] = useState({
    response: '',
    status: 'open' as SupportTicketStatus,
  });

  const isAdmin = user?.role === 'admin';

  // Filter stations based on selected journey
  const filteredStations = useMemo(() => {
    if (!newTicket.journey_id) return [];
    return stations.filter(s => s.journey_id === newTicket.journey_id).sort((a, b) => a.order_index - b.order_index);
  }, [newTicket.journey_id, stations]);

  const fetchTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user names for admin view and add journey/station titles
      if (data) {
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);
        
        // Create maps for journey and station titles
        const journeyMap = new Map(journeys.map(j => [j.id, j.title]));
        const stationMap = new Map(stations.map(s => [s.id, s.title]));
        
        const ticketsWithData = data.map(t => ({
          ...t,
          user_name: isAdmin ? (profileMap.get(t.user_id) || 'Usuário desconhecido') : undefined,
          journey_title: t.journey_id ? journeyMap.get(t.journey_id) : undefined,
          station_title: t.station_id ? stationMap.get(t.station_id) : undefined,
        }));
        setTickets(ticketsWithData as SupportTicket[]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tickets.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user, journeys, stations]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não permitido',
        description: 'Envie imagens (JPG, PNG, GIF, WEBP) ou documentos (PDF, TXT, DOC, DOCX).',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user || !newTicket.title.trim() || !newTicket.description.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o título e a descrição.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentUrl: string | null = null;
      
      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: newTicket.title.trim(),
          description: newTicket.description.trim(),
          type: newTicket.type,
          attachment_url: attachmentUrl,
          journey_id: newTicket.journey_id || null,
          station_id: newTicket.station_id || null,
        });

      if (error) throw error;

      // Log ticket creation
      logAction('create_support_ticket', 'platform', {
        journeyId: newTicket.journey_id || undefined,
        stationId: newTicket.station_id || undefined,
        metadata: { title: newTicket.title, type: newTicket.type },
      });

      toast({
        title: 'Ticket criado',
        description: 'Sua solicitação foi enviada com sucesso.',
      });

      setNewTicket({ type: 'bug', title: '', description: '', journey_id: '', station_id: '' });
      setSelectedFile(null);
      setFilePreview(null);
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondTicket = async () => {
    if (!user || !selectedTicket) return;

    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {
        status: responseForm.status,
      };

      if (responseForm.response.trim()) {
        updateData.response = responseForm.response.trim();
        updateData.responded_by = user.id;
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Ticket atualizado',
        description: 'A resposta foi salva com sucesso.',
      });

      setRespondDialogOpen(false);
      setSelectedTicket(null);
      setResponseForm({ response: '', status: 'open' });
      fetchTickets();
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Ticket excluído',
        description: 'O ticket foi removido com sucesso.',
      });

      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o ticket.',
        variant: 'destructive',
      });
    }
  };

  const openRespondDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponseForm({
      response: ticket.response || '',
      status: ticket.status,
    });
    setRespondDialogOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (typeFilter !== 'all' && ticket.type !== typeFilter) return false;
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    return true;
  });

  const StatusIcon = ({ status }: { status: SupportTicketStatus }) => {
    switch (status) {
      case 'open':
        return <Circle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Suporte</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Gerencie as solicitações dos usuários' 
                : 'Reporte problemas ou sugira melhorias'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setNewTicket({ type: 'bug', title: '', description: '', journey_id: '', station_id: '' });
              removeSelectedFile();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Ticket de Suporte</DialogTitle>
                <DialogDescription>
                  Descreva o problema ou sugestão de melhoria.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de solicitação</Label>
                  <RadioGroup
                    value={newTicket.type}
                    onValueChange={(value) => setNewTicket({ ...newTicket, type: value as SupportTicketType })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bug" id="type-bug" />
                      <Label htmlFor="type-bug" className="flex items-center gap-2 cursor-pointer">
                        <Bug className="h-4 w-4 text-destructive" />
                        Reportar Bug
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="improvement" id="type-improvement" />
                      <Label htmlFor="type-improvement" className="flex items-center gap-2 cursor-pointer">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Sugerir Melhoria
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Resumo da solicitação"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>

                {/* Journey and Station Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Jornada (opcional)
                    </Label>
                    <Select
                      value={newTicket.journey_id || '__none__'}
                      onValueChange={(value) => setNewTicket({ 
                        ...newTicket, 
                        journey_id: value === '__none__' ? '' : value,
                        station_id: '' // Reset station when journey changes
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
                        {journeys.map((journey) => (
                          <SelectItem key={journey.id} value={journey.id}>
                            {journey.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Estação (opcional)
                    </Label>
                    <Select
                      value={newTicket.station_id || '__none__'}
                      onValueChange={(value) => setNewTicket({ 
                        ...newTicket, 
                        station_id: value === '__none__' ? '' : value 
                      })}
                      disabled={!newTicket.journey_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={newTicket.journey_id ? "Selecione" : "Selecione uma jornada primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
                        {filteredStations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva em detalhes..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>
                
                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label>Anexo (opcional)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!selectedFile ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Anexar arquivo ou imagem
                    </Button>
                  ) : (
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {selectedFile.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                          <span className="text-muted-foreground">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={removeSelectedFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {filePreview && (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-h-32 rounded-md object-contain"
                        />
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: imagens (JPG, PNG, GIF, WEBP) e documentos (PDF, TXT, DOC, DOCX). Máx: 10MB
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTicket} disabled={isSubmitting || isUploading}>
                  {(isSubmitting || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isUploading ? 'Enviando arquivo...' : 'Enviar Ticket'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters for admin */}
        {isAdmin && (
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="bug">Bugs</SelectItem>
                  <SelectItem value="improvement">Melhorias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tickets list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground">
                {isAdmin ? 'Não há tickets com os filtros selecionados.' : 'Você ainda não criou nenhum ticket.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {ticket.type === 'bug' ? (
                        <Bug className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {isAdmin && ticket.user_name && (
                            <span className="font-medium">{ticket.user_name} • </span>
                          )}
                          {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={statusColors[ticket.status]}>
                        <StatusIcon status={ticket.status} />
                        <span className="ml-1">{statusLabels[ticket.status]}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Journey and Station Info */}
                  {(ticket.journey_title || ticket.station_title) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {ticket.journey_title && (
                        <span className="flex items-center gap-1">
                          <Route className="h-4 w-4" />
                          {ticket.journey_title}
                        </span>
                      )}
                      {ticket.station_title && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {ticket.station_title}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                  
                  {/* Attachment display */}
                  {ticket.attachment_url && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        Anexo
                      </div>
                      {isImageUrl(ticket.attachment_url) ? (
                        <a
                          href={ticket.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={ticket.attachment_url}
                            alt="Anexo"
                            className="max-h-48 rounded-md object-contain hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <a
                          href={ticket.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {getFileName(ticket.attachment_url)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                  
                  {ticket.response && (
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                      <p className="text-sm font-medium text-primary mb-1">Resposta da equipe:</p>
                      <p className="text-sm whitespace-pre-wrap">{ticket.response}</p>
                      {ticket.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(ticket.responded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    {isAdmin && (
                      <Button variant="outline" size="sm" onClick={() => openRespondDialog(ticket)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Responder
                      </Button>
                    )}
                    {(ticket.user_id === user?.id && !ticket.response) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Respond Dialog (Admin) */}
        <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responder Ticket</DialogTitle>
              <DialogDescription>
                {selectedTicket?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={responseForm.status}
                  onValueChange={(value) => setResponseForm({ ...responseForm, status: value as SupportTicketStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Resposta</Label>
                <Textarea
                  id="response"
                  placeholder="Escreva sua resposta..."
                  rows={4}
                  value={responseForm.response}
                  onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespondDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRespondTicket} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
