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
  hasFeedback: boolean;
}

export function DeletionRequestButton({ submissionId, hasFeedback }: DeletionRequestButtonProps) {
  const { user } = useAuth();
  const { deletionRequests, createDeletionRequest, deleteSubmission } = useData();
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

  const handleDirectDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteSubmission(submissionId);
      toast.success('Submissão removida! Você pode reenviar agora.');
      setOpen(false);
    } catch {
      toast.error('Erro ao remover submissão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRedo = async () => {
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
      <Button variant="default" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <RotateCcw className="h-3.5 w-3.5" />
        {hasFeedback ? 'Solicitar Refazer' : 'Refazer Atividade'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasFeedback ? 'Solicitar Refazer Atividade' : 'Refazer Atividade'}
            </DialogTitle>
            <DialogDescription>
              {hasFeedback
                ? 'Sua solicitação será analisada por um(a) administrador(a) ou tutor(a). Se aprovada, sua resposta anterior será excluída e você poderá enviar novamente.'
                : 'Tem certeza que deseja refazer esta atividade? Sua resposta atual será excluída permanentemente.'}
            </DialogDescription>
          </DialogHeader>
          {hasFeedback && (
            <div className="space-y-2">
              <Label>Motivo da solicitação</Label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Descreva por que deseja refazer esta atividade..."
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            {hasFeedback ? (
              <Button onClick={handleRequestRedo} disabled={isSubmitting || !reason.trim()}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            ) : (
              <Button onClick={handleDirectDelete} disabled={isSubmitting} variant="destructive">
                {isSubmitting ? 'Removendo...' : 'Confirmar e Refazer'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
