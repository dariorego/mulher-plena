import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

type LightColor = 'red' | 'yellow' | 'green';

const lightConfig: Record<LightColor, { emoji: string; title: string; subtitle: string; placeholder: string; bgClass: string; glowShadow: string; textColor: string; borderColor: string; label: string }> = {
  red: {
    emoji: '🚦',
    title: 'Pare e Reavalie',
    subtitle: 'Que comportamento, pensamento ou hábito precisa ser interrompido?',
    placeholder: 'Descreva o que precisa parar em sua vida...',
    bgClass: 'bg-red-500',
    glowShadow: 'shadow-[0_0_18px_4px_rgba(239,68,68,0.5)]',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    label: 'Parar',
  },
  yellow: {
    emoji: '⚠️',
    title: 'Atenção e Ajuste',
    subtitle: 'O que exige mais cuidado, equilíbrio ou vigilância?',
    placeholder: 'Descreva o que precisa de atenção e ajuste...',
    bgClass: 'bg-yellow-400',
    glowShadow: 'shadow-[0_0_18px_4px_rgba(234,179,8,0.5)]',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    label: 'Atenção',
  },
  green: {
    emoji: '✅',
    title: 'Siga Fortalecendo',
    subtitle: 'Quais práticas e atitudes promovem amor, saúde e bem-estar?',
    placeholder: 'Descreva o que deve continuar e crescer ainda mais...',
    bgClass: 'bg-green-500',
    glowShadow: 'shadow-[0_0_18px_4px_rgba(34,197,94,0.5)]',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    label: 'Seguir',
  },
};

const colors: LightColor[] = ['red', 'yellow', 'green'];

// ─────────────────────────── Form component ───────────────────────────

interface LifeTrafficLightActivityProps {
  description: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

export function LifeTrafficLightActivity({ description, onSubmit, isSubmitting, fontSizeClass }: LifeTrafficLightActivityProps) {
  const [answers, setAnswers] = useState<Record<LightColor, string>>({ red: '', yellow: '', green: '' });

  const allFilled = colors.every(c => answers[c].trim().length > 0);

  const handleSubmit = () => {
    const content = `### Farol da Minha Vida\n\n---\n\n- Vermelho (Parar): ${answers.red.trim()}\n- Amarelo (Atenção): ${answers.yellow.trim()}\n- Verde (Seguir): ${answers.green.trim()}`;
    onSubmit(content);
  };

  return (
    <div className="space-y-6">
      {/* Orientation */}
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

      {/* Three fields */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Reflexão</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      <div className="space-y-6">
        {colors.map(color => {
          const cfg = lightConfig[color];
          return (
            <div key={color} className={`rounded-lg border ${cfg.borderColor} bg-background p-5 space-y-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${cfg.bgClass} ${cfg.glowShadow} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-[10px] uppercase tracking-wide">{cfg.label}</span>
                </div>
                <div>
                  <p className={`font-semibold ${cfg.textColor}`}>{cfg.emoji} {cfg.title}</p>
                  <p className="text-xs text-muted-foreground">{cfg.subtitle}</p>
                </div>
              </div>
              <Textarea
                value={answers[color]}
                onChange={e => setAnswers(prev => ({ ...prev, [color]: e.target.value }))}
                placeholder={cfg.placeholder}
                rows={4}
                className={`resize-none border-primary/20 focus:${cfg.borderColor} bg-cream/30`}
              />
            </div>
          );
        })}
      </div>

      {/* Status */}
      <p className="text-xs text-muted-foreground text-center">
        {allFilled ? (
          <span className="text-green-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" /> Todas as reflexões preenchidas
          </span>
        ) : (
          'Preencha as três reflexões (vermelha, amarela e verde) para enviar'
        )}
      </p>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !allFilled}
        className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Reflexão'}
      </Button>
    </div>
  );
}

// ─────────────────────── Submitted view component ───────────────────────

function parseLifeTrafficLightContent(content: string): Record<LightColor, string> {
  const result: Record<LightColor, string> = { red: '', yellow: '', green: '' };
  const redMatch = content.match(/- Vermelho \(Parar\):\s*(.+)/);
  const yellowMatch = content.match(/- Amarelo \(Aten[çc][ãa]o\):\s*(.+)/);
  const greenMatch = content.match(/- Verde \(Seguir\):\s*(.+)/);
  if (redMatch) result.red = redMatch[1].trim();
  if (yellowMatch) result.yellow = yellowMatch[1].trim();
  if (greenMatch) result.green = greenMatch[1].trim();
  return result;
}

interface SubmittedLifeTrafficLightViewProps {
  content: string;
}

export function SubmittedLifeTrafficLightView({ content }: SubmittedLifeTrafficLightViewProps) {
  const parsed = parseLifeTrafficLightContent(content);
  const [selectedColor, setSelectedColor] = useState<LightColor | null>(null);

  const hasData = parsed.red || parsed.yellow || parsed.green;
  if (!hasData) {
    return <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>;
  }

  const config = selectedColor ? lightConfig[selectedColor] : null;

  return (
    <>
      <div className="flex justify-center py-4">
        <div className="flex flex-col items-center">
          <p className="font-semibold text-foreground text-sm mb-3 text-center">Farol da Minha Vida</p>

          <div className="relative">
            <div className="w-28 bg-[hsl(0,0%,30%)] rounded-2xl p-3 space-y-3 shadow-lg border-2 border-[hsl(0,0%,22%)]">
              {colors.map(color => {
                const cfg = lightConfig[color];
                return (
                  <div key={color} className="flex items-center justify-center">
                    <button
                      onClick={() => setSelectedColor(color)}
                      className={`w-20 h-20 rounded-full ${cfg.bgClass} shadow-[0_0_18px_4px_${color === 'red' ? 'rgba(239,68,68,0.5)' : color === 'yellow' ? 'rgba(234,179,8,0.5)' : 'rgba(34,197,94,0.5)'},inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95`}
                    >
                      <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">
                        {cfg.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Pole */}
            <div className="w-4 h-10 bg-[hsl(0,0%,35%)] mx-auto rounded-b-sm shadow-md" />
            <div className="w-12 h-3 bg-[hsl(0,0%,30%)] mx-auto rounded-full shadow-md" />
          </div>

          <p className="text-xs text-muted-foreground mt-3 italic">Clique em cada luz para ver a reflexão</p>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedColor} onOpenChange={() => setSelectedColor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Farol da Minha Vida</DialogTitle>
          </DialogHeader>
          {selectedColor && config && (
            <div className="flex items-start gap-4 py-3">
              <div className={`w-10 h-10 rounded-full ${config.bgClass} flex-shrink-0 mt-0.5 ${config.glowShadow}`} />
              <div>
                <p className={`text-sm font-bold uppercase tracking-wide ${config.textColor}`}>{config.title}</p>
                <p className="text-sm text-foreground mt-1">{parsed[selectedColor]}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
