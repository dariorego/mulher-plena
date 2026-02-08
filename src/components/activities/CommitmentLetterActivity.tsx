import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Heart, Star, Trophy, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommitmentLetterActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

export function CommitmentLetterActivity({ description, onSubmit, isSubmitting, fontSizeClass }: CommitmentLetterActivityProps) {
  const [letter, setLetter] = useState('');
  const [memory, setMemory] = useState('');
  const [loveActionDone, setLoveActionDone] = useState(false);
  const [secretMissionDone, setSecretMissionDone] = useState(false);

  const completedLevels = [
    memory.trim().length > 0,
    loveActionDone,
    secretMissionDone,
  ].filter(Boolean).length;

  const progressPercent = (completedLevels / 3) * 100;

  const canSubmit = letter.trim().length >= 100;

  const handleSubmit = () => {
    const memorySection = memory.trim()
      ? memory.trim()
      : '⬜ Pendente';
    const loveSection = loveActionDone
      ? '✅ Missão cumprida!'
      : '⬜ Pendente';
    const secretSection = secretMissionDone
      ? '✅ Missão cumprida!'
      : '⬜ Pendente';

    const content = `### Carta de Compromisso

${letter.trim()}

---

**Nível 1 – Memória Especial:**
${memorySection}

---

**Nível 2 – Ação de Amor:**
${loveSection}

---

**Nível 3 – Missão Secreta:**
${secretSection}

---

**Progresso:** ${completedLevels}/3 níveis completos`;

    onSubmit(content);
  };

  return (
    <div className="space-y-6">
      {/* Orientação */}
      {description && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
              <div className="flex-1 h-px bg-primary/20" />
            </div>
            <FontSizeControl />
          </div>
          <div
            className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary [&_em]:italic [&_em]:text-muted-foreground ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Carta Principal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Carta</span>
          <div className="flex-1 h-px bg-primary/20" />
        </div>
        <Textarea
          placeholder="Escreva sua carta de compromisso ao cônjuge..."
          value={letter}
          onChange={e => setLetter(e.target.value)}
          rows={8}
          className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-accent/5"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 100 caracteres. Atual:{' '}
          <span className={letter.length >= 100 ? 'text-green-600 font-medium' : ''}>
            {letter.length}
          </span>
        </p>
      </div>

      {/* Jogo de Fases */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Jogo de Fases</span>
          <div className="flex-1 h-px bg-primary/20" />
        </div>

        {/* Nível 1 – Memória Especial */}
        <div
          className={cn(
            'rounded-lg border p-5 transition-colors duration-300',
            memory.trim().length > 0
              ? 'border-green-300 bg-green-50/60'
              : 'border-border bg-muted/30'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
              memory.trim().length > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            )}>
              <Heart className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">Nível 1 – Memória Especial</h4>
              <p className="text-xs text-muted-foreground">
                Reviva um momento marcante do namoro. Escreva sobre o que sentiu ou compartilhe qual lembrança veio primeiro à sua mente.
              </p>
            </div>
            {memory.trim().length > 0 && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          <Textarea
            placeholder="Descreva sua memória especial..."
            value={memory}
            onChange={e => setMemory(e.target.value)}
            rows={4}
            className="resize-none border-primary/20 focus:border-primary focus:ring-primary/20 bg-background/60"
          />
        </div>

        {/* Nível 2 – Ação de Amor */}
        <div
          className={cn(
            'rounded-lg border p-5 transition-colors duration-300',
            loveActionDone
              ? 'border-green-300 bg-green-50/60'
              : 'border-border bg-muted/30'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
              loveActionDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            )}>
              <Star className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">Nível 2 – Ação de Amor</h4>
              <p className="text-xs text-muted-foreground">
                Realize hoje um gesto simples que expresse carinho — pode ser um abraço mais longo, preparar um café, escrever um bilhete ou qualquer outro gesto de afeto.
              </p>
            </div>
            {loveActionDone && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          <label className="flex items-center gap-3 mt-4 ml-11 cursor-pointer select-none">
            <Checkbox
              checked={loveActionDone}
              onCheckedChange={(checked) => setLoveActionDone(!!checked)}
            />
            <span className="text-sm font-medium text-foreground">Missão cumprida!</span>
          </label>
        </div>

        {/* Nível 3 – Missão Secreta */}
        <div
          className={cn(
            'rounded-lg border p-5 transition-colors duration-300',
            secretMissionDone
              ? 'border-green-300 bg-green-50/60'
              : 'border-border bg-muted/30'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
              secretMissionDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            )}>
              <Trophy className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">Nível 3 – Missão Secreta</h4>
              <p className="text-xs text-muted-foreground">
                Planeje uma surpresa: pode ser um passeio diferente, uma viagem, uma noite temática em casa ou qualquer experiência que nos faça sorrir juntos.
              </p>
            </div>
            {secretMissionDone && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          <label className="flex items-center gap-3 mt-4 ml-11 cursor-pointer select-none">
            <Checkbox
              checked={secretMissionDone}
              onCheckedChange={(checked) => setSecretMissionDone(!!checked)}
            />
            <span className="text-sm font-medium text-foreground">Missão cumprida!</span>
          </label>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progresso</span>
            <span className="font-semibold text-primary">{completedLevels}/3 níveis completos</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </div>

      {/* Botão de Enviar */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !canSubmit}
        className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Atividade'}
      </Button>
    </div>
  );
}

/* ─── Submitted View ─── */

interface SubmittedCommitmentLetterViewProps {
  content: string;
}

export function SubmittedCommitmentLetterView({ content }: SubmittedCommitmentLetterViewProps) {
  // Parse markdown content
  const letterMatch = content.match(/### Carta de Compromisso\s*\n\n([\s\S]*?)(?=\n---\n)/);
  const memoryMatch = content.match(/\*\*Nível 1 – Memória Especial:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const loveMatch = content.match(/\*\*Nível 2 – Ação de Amor:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const secretMatch = content.match(/\*\*Nível 3 – Missão Secreta:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const progressMatch = content.match(/\*\*Progresso:\*\*\s*(.*)/);

  const letterText = letterMatch?.[1]?.trim() || '';
  const memoryText = memoryMatch?.[1]?.trim() || '';
  const loveText = loveMatch?.[1]?.trim() || '';
  const secretText = secretMatch?.[1]?.trim() || '';
  const progressText = progressMatch?.[1]?.trim() || '';

  const isCompleted = (text: string) => text.includes('✅');

  return (
    <div className="space-y-4">
      {/* Carta */}
      {letterText && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-primary">Carta de Compromisso</h4>
          <p className="whitespace-pre-wrap text-sm text-foreground bg-accent/5 p-4 rounded-lg border border-primary/10">
            {letterText}
          </p>
        </div>
      )}

      {/* Níveis */}
      <div className="space-y-3">
        {/* Nível 1 */}
        <div className={cn(
          'flex items-start gap-3 p-3 rounded-lg border',
          memoryText && !memoryText.includes('⬜') ? 'border-green-200 bg-green-50/50' : 'border-border bg-muted/20'
        )}>
          <div className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
            memoryText && !memoryText.includes('⬜') ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
          )}>
            <Heart className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-semibold">Nível 1 – Memória Especial</h5>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{memoryText}</p>
          </div>
        </div>

        {/* Nível 2 */}
        <div className={cn(
          'flex items-start gap-3 p-3 rounded-lg border',
          isCompleted(loveText) ? 'border-green-200 bg-green-50/50' : 'border-border bg-muted/20'
        )}>
          <div className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
            isCompleted(loveText) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
          )}>
            <Star className="h-3.5 w-3.5" />
          </div>
          <div>
            <h5 className="text-sm font-semibold">Nível 2 – Ação de Amor</h5>
            <p className="text-sm text-muted-foreground mt-1">{loveText}</p>
          </div>
        </div>

        {/* Nível 3 */}
        <div className={cn(
          'flex items-start gap-3 p-3 rounded-lg border',
          isCompleted(secretText) ? 'border-green-200 bg-green-50/50' : 'border-border bg-muted/20'
        )}>
          <div className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
            isCompleted(secretText) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
          )}>
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <div>
            <h5 className="text-sm font-semibold">Nível 3 – Missão Secreta</h5>
            <p className="text-sm text-muted-foreground mt-1">{secretText}</p>
          </div>
        </div>
      </div>

      {/* Progresso */}
      {progressText && (
        <p className="text-sm font-medium text-primary text-right">{progressText}</p>
      )}
    </div>
  );
}
