import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimelineMoment {
  year: string;
  title: string;
  description: string;
}

interface TimelineActivityProps {
  description?: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const TIMELINE_COLORS = [
  '#C9A84C', // Dourado
  '#C94C6E', // Rosa
  '#4C7BC9', // Azul
  '#9B59B6', // Roxo
  '#27AE60', // Verde
  '#E67E22', // Laranja
  '#E74C3C', // Vermelho
  '#1ABC9C', // Turquesa
];

const MIN_MOMENTS = 5;

const createInitialMoments = (): TimelineMoment[] =>
  Array.from({ length: MIN_MOMENTS }, () => ({ year: '', title: '', description: '' }));

export function TimelineActivity({ description, onSubmit, isSubmitting, fontSizeClass }: TimelineActivityProps) {
  const [moments, setMoments] = useState<TimelineMoment[]>(createInitialMoments);
  const isMobile = useIsMobile();

  const updateMoment = (index: number, field: keyof TimelineMoment, value: string) => {
    setMoments(prev => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMoment = () => {
    setMoments(prev => [...prev, { year: '', title: '', description: '' }]);
  };

  const removeMoment = (index: number) => {
    if (moments.length <= MIN_MOMENTS) return;
    setMoments(prev => prev.filter((_, i) => i !== index));
  };

  const filledMoments = useMemo(
    () => moments.filter(m => m.year.trim() && m.title.trim()),
    [moments]
  );

  const sortedFilledMoments = useMemo(
    () => [...filledMoments].sort((a, b) => parseInt(a.year) - parseInt(b.year)),
    [filledMoments]
  );

  const isComplete = filledMoments.length >= MIN_MOMENTS;

  const formatContent = () => {
    const lines = sortedFilledMoments.map(m => {
      let entry = `**${m.year} - ${m.title}**`;
      if (m.description.trim()) entry += `\n${m.description.trim()}`;
      return entry;
    });
    return `### Linha da Vida\n\n${lines.join('\n\n')}`;
  };

  const handleSubmit = async () => {
    await onSubmit(formatContent());
  };

  const getColor = (index: number) => TIMELINE_COLORS[index % TIMELINE_COLORS.length];

  return (
    <div className="space-y-6">
      {/* Orientation Section */}
      {description && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>
            <FontSizeControl />
          </div>
          <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>{description}</p>
        </div>
      )}

      {/* Timeline Visualization */}
      {sortedFilledMoments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Linha do Tempo</span>
            <div className="flex-1 h-px bg-primary/20"></div>
          </div>

          {isMobile ? (
            <MobileTimeline moments={sortedFilledMoments} getColor={getColor} />
          ) : (
            <DesktopTimeline moments={sortedFilledMoments} getColor={getColor} />
          )}
        </div>
      )}

      {/* Form Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seus Momentos</span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>

        {moments.map((moment, index) => {
          const isFilled = moment.year.trim() && moment.title.trim();
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                isFilled
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(index) }}
                  />
                  <span className="text-sm font-semibold text-primary">
                    Momento {index + 1}
                  </span>
                  {isFilled && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                {moments.length > MIN_MOMENTS && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
                    onClick={() => removeMoment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ano *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={moment.year}
                    onChange={e => updateMoment(index, 'year', e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 2005"
                    className="border-primary/20 focus:border-accent bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Título *</Label>
                  <Input
                    value={moment.title}
                    onChange={e => updateMoment(index, 'title', e.target.value)}
                    placeholder="Ex: Formatura do Ensino Médio"
                    className="border-primary/20 focus:border-accent bg-background"
                  />
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
                <Textarea
                  value={moment.description}
                  onChange={e => updateMoment(index, 'description', e.target.value)}
                  placeholder="Descreva brevemente por que esse momento foi marcante..."
                  rows={2}
                  className="resize-none border-primary/20 focus:border-accent bg-background"
                />
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={addMoment}
          className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Momento
        </Button>

        {/* Progress and Submit */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-center text-muted-foreground">
            {isComplete ? (
              <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {filledMoments.length} momento{filledMoments.length !== 1 ? 's' : ''} preenchido{filledMoments.length !== 1 ? 's' : ''} — pronto para enviar!
              </span>
            ) : (
              `${filledMoments.length}/${MIN_MOMENTS} momentos preenchidos (mínimo de ${MIN_MOMENTS})`
            )}
          </p>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isComplete}
            className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Atividade'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Desktop horizontal timeline ── */
function DesktopTimeline({ moments, getColor }: { moments: TimelineMoment[]; getColor: (i: number) => string }) {
  return (
    <div className="relative overflow-x-auto py-4">
      <div className="flex items-start gap-0 min-w-max px-4">
        {moments.map((m, i) => (
          <div key={i} className="flex flex-col items-center" style={{ minWidth: 140 }}>
            {/* Year */}
            <span className="text-xs font-bold text-primary mb-2">{m.year}</span>

            {/* Circle + connector */}
            <div className="relative flex items-center w-full justify-center">
              {/* Left connector */}
              {i > 0 && (
                <div className="absolute right-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
              )}
              {/* Right connector */}
              {i < moments.length - 1 && (
                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
              )}

              <div
                className="relative z-10 w-7 h-7 rounded-full border-[3px] border-white shadow-md"
                style={{ backgroundColor: getColor(i) }}
              />
            </div>

            {/* Title & description */}
            <span className="text-xs font-semibold text-foreground mt-2 text-center max-w-[130px] truncate">
              {m.title}
            </span>
            {m.description.trim() && (
              <span className="text-[10px] text-muted-foreground mt-0.5 text-center max-w-[130px] line-clamp-2">
                {m.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mobile vertical timeline ── */
function MobileTimeline({ moments, getColor }: { moments: TimelineMoment[]; getColor: (i: number) => string }) {
  return (
    <div className="relative pl-8 py-2">
      {/* Vertical line */}
      <div className="absolute left-[14px] top-4 bottom-4 w-[3px] bg-accent/40 rounded-full" />

      <div className="space-y-5">
        {moments.map((m, i) => (
          <div key={i} className="relative flex items-start gap-4">
            {/* Circle */}
            <div
              className="absolute left-[-22px] top-0.5 w-6 h-6 rounded-full border-[3px] border-background shadow-md z-10"
              style={{ backgroundColor: getColor(i) }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-accent">{m.year}</span>
              <p className="text-sm font-semibold text-foreground leading-tight">{m.title}</p>
              {m.description.trim() && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
