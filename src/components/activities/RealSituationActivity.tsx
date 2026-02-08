import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { BookOpen, Lightbulb, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealSituationActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const MIN_CHARS = 50;

export function RealSituationActivity({ description, onSubmit, isSubmitting, fontSizeClass }: RealSituationActivityProps) {
  const [level1, setLevel1] = useState('');
  const [level2, setLevel2] = useState('');
  const [level3, setLevel3] = useState('');

  const level1Done = level1.trim().length >= MIN_CHARS;
  const level2Done = level2.trim().length >= MIN_CHARS;
  const level3Done = level3.trim().length >= MIN_CHARS;

  const completedLevels = [level1Done, level2Done, level3Done].filter(Boolean).length;
  const progressPercent = (completedLevels / 3) * 100;
  const canSubmit = level1Done && level2Done && level3Done;

  const handleSubmit = () => {
    const content = `### Registro de Situação Real

**Nível 1 – Portal da Memória:**
${level1.trim()}

---

**Nível 2 – Espelho da Sabedoria:**
${level2.trim()}

---

**Nível 3 – Tesouro da Transformação:**
${level3.trim()}

---

**Progresso:** ${completedLevels}/3 níveis completos`;

    onSubmit(content);
  };

  const levels = [
    {
      key: 'level1',
      icon: BookOpen,
      title: 'Nível 1 – Portal da Memória',
      description: 'Lembre-se de um conflito que já aconteceu. Escreva, de forma simples, o que aconteceu e como você se sentiu.',
      placeholder: 'Descreva o conflito e como você se sentiu...',
      value: level1,
      onChange: setLevel1,
      done: level1Done,
    },
    {
      key: 'level2',
      icon: Lightbulb,
      title: 'Nível 2 – Espelho da Sabedoria',
      description: 'Imagine como teria sido se você tivesse aplicado um princípio da Seicho-No-Ie. Pergunte-se: "O que eu teria feito de diferente?"',
      placeholder: 'Reflita sobre o que teria feito de diferente...',
      value: level2,
      onChange: setLevel2,
      done: level2Done,
      hints: [
        'Ver o outro como Filho de Deus',
        'Praticar gratidão',
        'Cultivar pensamentos positivos',
      ],
    },
    {
      key: 'level3',
      icon: Sparkles,
      title: 'Nível 3 – Tesouro da Transformação',
      description: 'Reescreva a história desse conflito, mostrando como VOCÊ poderia ter resolvido de forma mais harmoniosa e positiva.',
      placeholder: 'Reescreva a história de forma harmoniosa e positiva...',
      value: level3,
      onChange: setLevel3,
      done: level3Done,
    },
  ];

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

      {/* Níveis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Níveis de Reflexão</span>
          <div className="flex-1 h-px bg-primary/20" />
        </div>

        {levels.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <div
              key={lvl.key}
              className={cn(
                'rounded-lg border p-5 transition-colors duration-300',
                lvl.done
                  ? 'border-green-300 bg-green-50/60'
                  : 'border-border bg-muted/30'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                    lvl.done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{lvl.title}</h4>
                  <p className="text-xs text-muted-foreground">{lvl.description}</p>
                </div>
                {lvl.done && (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
              </div>

              {/* Hints para nível 2 */}
              {lvl.hints && (
                <div className="mb-3 ml-11">
                  <p className="text-xs text-muted-foreground mb-1">Princípios sugeridos:</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {lvl.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Textarea
                placeholder={lvl.placeholder}
                value={lvl.value}
                onChange={(e) => lvl.onChange(e.target.value)}
                rows={5}
                className="resize-none border-primary/20 focus:border-primary focus:ring-primary/20 bg-background/60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de {MIN_CHARS} caracteres. Atual:{' '}
                <span className={lvl.value.trim().length >= MIN_CHARS ? 'text-green-600 font-medium' : ''}>
                  {lvl.value.trim().length}
                </span>
              </p>
            </div>
          );
        })}

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

interface SubmittedRealSituationViewProps {
  content: string;
}

export function SubmittedRealSituationView({ content }: SubmittedRealSituationViewProps) {
  const level1Match = content.match(/\*\*Nível 1 – Portal da Memória:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const level2Match = content.match(/\*\*Nível 2 – Espelho da Sabedoria:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const level3Match = content.match(/\*\*Nível 3 – Tesouro da Transformação:\*\*\s*\n([\s\S]*?)(?=\n---\n)/);
  const progressMatch = content.match(/\*\*Progresso:\*\*\s*(.*)/);

  const level1Text = level1Match?.[1]?.trim() || '';
  const level2Text = level2Match?.[1]?.trim() || '';
  const level3Text = level3Match?.[1]?.trim() || '';
  const progressText = progressMatch?.[1]?.trim() || '';

  const levels = [
    { icon: BookOpen, title: 'Nível 1 – Portal da Memória', text: level1Text },
    { icon: Lightbulb, title: 'Nível 2 – Espelho da Sabedoria', text: level2Text },
    { icon: Sparkles, title: 'Nível 3 – Tesouro da Transformação', text: level3Text },
  ];

  return (
    <div className="space-y-3">
      {levels.map((lvl, i) => {
        const Icon = lvl.icon;
        const hasContent = lvl.text.length > 0;
        return (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border',
              hasContent ? 'border-green-200 bg-green-50/50' : 'border-border bg-muted/20'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
                hasContent ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold">{lvl.title}</h5>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{lvl.text}</p>
            </div>
          </div>
        );
      })}

      {progressText && (
        <p className="text-sm font-medium text-primary text-right">{progressText}</p>
      )}
    </div>
  );
}
