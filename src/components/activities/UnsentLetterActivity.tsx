import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FontSizeControl } from '@/components/ui/font-size-control';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Archive, Scissors, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ActivitySubmission } from '@/types';

interface UnsentLetterActivityProps {
  description: string | null;
  submission: ActivitySubmission | null;
  onSubmit: (content: string) => Promise<void>;
  onDeleteSubmission: (id: string) => Promise<void>;
  onUpdateContent: (id: string, content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

export function UnsentLetterActivity({
  description,
  submission,
  onSubmit,
  onDeleteSubmission,
  onUpdateContent,
  isSubmitting,
  fontSizeClass,
}: UnsentLetterActivityProps) {
  const [content, setContent] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionTaken, setActionTaken] = useState<'kept' | 'torn' | 'thrown' | null>(null);
  const [tearAnimation, setTearAnimation] = useState(false);
  const [fadeAnimation, setFadeAnimation] = useState(false);

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    await onSubmit(content);
  };

  const handleKeep = () => {
    setActionTaken('kept');
    toast.success('Sua carta foi guardada com carinho. 💛');
  };

  const handleTear = async () => {
    if (!submission) return;
    setTearAnimation(true);
    setTimeout(async () => {
      await onUpdateContent(submission.id, '[Carta rasgada pela participante]');
      setActionTaken('torn');
      toast.success('Sua carta foi rasgada. Que esse gesto traga leveza. 🍃');
    }, 1500);
  };

  const handleThrowAway = async () => {
    if (!submission) return;
    setFadeAnimation(true);
    setTimeout(async () => {
      await onDeleteSubmission(submission.id);
      setActionTaken('thrown');
      toast.success('Sua carta foi descartada. Um novo começo. ✨');
    }, 2000);
  };

  const isTorn = submission?.content === '[Carta rasgada pela participante]';

  // POST-SUBMIT VIEW
  if (submission) {
    return (
      <div className="space-y-6">
        {/* Tear & fade-away keyframes */}
        <style>{`
          @keyframes letter-tear {
            0% { transform: rotate(0deg) scale(1); opacity: 1; }
            20% { transform: rotate(-2deg) scale(1.01); opacity: 1; }
            50% { transform: rotate(3deg) scale(0.95); opacity: 0.6; }
            100% { transform: rotate(6deg) scale(0.7) translateY(30px); opacity: 0; }
          }
          @keyframes letter-fade-away {
            0% { opacity: 1; transform: scale(1) translateY(0); }
            60% { opacity: 0.3; transform: scale(0.96) translateY(15px); }
            100% { opacity: 0; transform: scale(0.9) translateY(40px); }
          }
        `}</style>

        {/* Success badge */}
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">Carta enviada com sucesso!</p>
            <p className="text-sm text-green-700">
              Enviada em {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Letter content */}
        {!isTorn && actionTaken !== 'thrown' && (
          <div
            className="relative bg-cream/50 border border-primary/20 rounded-lg p-6"
            style={
              tearAnimation
                ? { animation: 'letter-tear 1.5s ease-in-out forwards' }
                : fadeAnimation
                ? { animation: 'letter-fade-away 2s ease-in-out forwards' }
                : undefined
            }
          >
            <p className={`text-foreground whitespace-pre-wrap leading-relaxed ${fontSizeClass}`}>
              {submission.content}
            </p>
          </div>
        )}

        {/* Torn message */}
        {(isTorn || actionTaken === 'torn') && !tearAnimation && (
          <div className="text-center py-8 text-muted-foreground italic">
            <p>Esta carta foi rasgada pela participante.</p>
          </div>
        )}

        {/* Thrown away message */}
        {actionTaken === 'thrown' && (
          <div className="text-center py-8 text-muted-foreground italic">
            <p>Esta carta foi descartada pela participante.</p>
          </div>
        )}

        {/* Action buttons - only show if no action taken yet and not torn */}
        {!actionTaken && !isTorn && (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Agora que você escreveu sua carta, o que deseja fazer com ela?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleKeep}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Archive className="h-4 w-4" />
                Guardar
              </Button>
              <Button
                onClick={handleTear}
                variant="outline"
                className="border-orange-400 text-orange-600 hover:bg-orange-50 gap-2"
                disabled={tearAnimation}
              >
                <Scissors className="h-4 w-4" />
                Rasgar
              </Button>
              <Button
                onClick={handleThrowAway}
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50 gap-2"
                disabled={fadeAnimation}
              >
                <Trash2 className="h-4 w-4" />
                Jogar Fora
              </Button>
            </div>
          </div>
        )}

        {/* Kept confirmation message */}
        {actionTaken === 'kept' && (
          <div className="text-center py-4">
            <p className="text-primary font-medium">Sua carta foi guardada com carinho. 💛</p>
          </div>
        )}
      </div>
    );
  }

  // WRITING PHASE
  return (
    <div className="space-y-6">
      {/* Orientation rendered as HTML */}
      {description && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>
            <FontSizeControl />
          </div>
          <div
            className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-foreground [&_strong]:font-semibold [&_strong]:text-primary ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Textarea for the letter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Carta</span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>
        <Textarea
          placeholder="Escreva sua carta aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-cream/30"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 100 caracteres. Atual:{' '}
          <span className={content.length >= 100 ? 'text-green-600 font-medium' : ''}>
            {content.length}
          </span>
        </p>
      </div>

      {/* Submit button */}
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isSubmitting || content.length < 100}
        className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Carta'}
      </Button>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja realmente enviar sua carta?</AlertDialogTitle>
            <AlertDialogDescription>
              Após o envio, você poderá escolher guardar, rasgar ou jogar fora a sua carta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Sim, enviar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
