import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Clock, XCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DeletionRequestButtonProps {
  submissionId: string;
}

export function DeletionRequestButton({ submissionId }: DeletionRequestButtonProps) {
  const { user } = useAuth();
  const { deletionRequests, createDeletionRequest } = useData();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'aluno') return null;

  const existingRequest = deletionRequests.find(
    r => r.submission_id === submissionId && r.user_id === user.id
  );

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      return (
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50">
          <Clock className="h-3 w-3" />
          Solicitação pendente
        </Badge>
      );
    }
    if (existingRequest.status === 'rejected') {
      return (
        <Badge variant="outline" className="gap-1 text-destructive border-destructive/30 bg-destructive/5">
          <XCircle className="h-3 w-3" />
          Solicitação recusada
        </Badge>
      );
    }
    return null;
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Informe o motivo da solicitação.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createDeletionRequest(submissionId, reason.trim());
      toast.success('Solicitação enviada! Aguarde a aprovação.');
      setOpen(false);
      setReason('');
    } catch {
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <RotateCcw className="h-3.5 w-3.5" />
        Solicitar Refazer
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Refazer Atividade</DialogTitle>
            <DialogDescription>
              Sua solicitação será analisada por um(a) administrador(a) ou tutor(a). Se aprovada, sua resposta anterior será excluída e você poderá enviar novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo da solicitação</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva por que deseja refazer esta atividade..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
