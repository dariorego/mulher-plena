import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, CheckCircle } from 'lucide-react';

const DAYS = 5;
const DIMENSIONS = ['Saúde Física', 'Saúde Mental', 'Saúde Espiritual'] as const;
const TOTAL_CELLS = DAYS * DIMENSIONS.length;

type DiaryData = string[][];

const createEmptyDiary = (): DiaryData =>
  Array.from({ length: DAYS }, () => Array(DIMENSIONS.length).fill(''));

interface WellBeingDiaryActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const formatMarkdown = (data: DiaryData): string => {
  const header = '### Diário do Bem-Estar\n\n';
  const rows = data
    .map(
      (row, i) =>
        `**${i + 1}º DIA**\n- **Saúde Física:** ${row[0]}\n- **Saúde Mental:** ${row[1]}\n- **Saúde Espiritual:** ${row[2]}`
    )
    .join('\n\n---\n\n');
  return header + rows;
};

export function WellBeingDiaryActivity({ description, onSubmit, isSubmitting, fontSizeClass }: WellBeingDiaryActivityProps) {
  const isMobile = useIsMobile();
  const [diary, setDiary] = useState<DiaryData>(createEmptyDiary);

  const updateCell = (day: number, dim: number, value: string) => {
    setDiary(prev => {
      const copy = prev.map(r => [...r]);
      copy[day][dim] = value;
      return copy;
    });
  };

  const filledCount = diary.flat().filter(v => v.trim() !== '').length;
  const canSubmit = filledCount === TOTAL_CELLS;
  const progressPercent = Math.round((filledCount / TOTAL_CELLS) * 100);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(formatMarkdown(diary));
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
            className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary [&_em]:italic [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_li]:text-foreground ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Label da tabela */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Diário do Bem-Estar</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Desktop: Tabela */}
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[100px]">Dia</th>
                {DIMENSIONS.map(dim => (
                  <th key={dim} className="px-4 py-3 text-left text-sm font-semibold">{dim}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diary.map((row, dayIdx) => (
                <tr key={dayIdx} className={dayIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'}>
                  <td className="px-4 py-3 font-semibold text-primary text-sm whitespace-nowrap">
                    {dayIdx + 1}º DIA
                  </td>
                  {row.map((val, dimIdx) => (
                    <td key={dimIdx} className="px-4 py-3">
                      <Input
                        value={val}
                        onChange={e => updateCell(dayIdx, dimIdx, e.target.value)}
                        placeholder={`Ex: ${dimIdx === 0 ? 'Caminhada 30min' : dimIdx === 1 ? 'Respiração consciente' : 'Meditação guiada'}`}
                        className="border-primary/20 bg-background"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile: Cartões empilhados por dia */
        <div className="space-y-4">
          {diary.map((row, dayIdx) => (
            <div
              key={dayIdx}
              className={`rounded-lg border border-primary/20 p-4 space-y-3 ${
                dayIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'
              }`}
            >
              <span className="text-sm font-semibold text-primary">{dayIdx + 1}º DIA</span>
              {DIMENSIONS.map((dim, dimIdx) => (
                <div key={dimIdx} className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">{dim}</label>
                  <Input
                    value={row[dimIdx]}
                    onChange={e => updateCell(dayIdx, dimIdx, e.target.value)}
                    placeholder={`Ex: ${dimIdx === 0 ? 'Caminhada 30min' : dimIdx === 1 ? 'Respiração consciente' : 'Meditação guiada'}`}
                    className="border-primary/20 bg-background"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Progresso + Botão enviar */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{filledCount}/{TOTAL_CELLS} campos preenchidos</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {canSubmit ? (
            <span className="text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> Todos os campos preenchidos!
            </span>
          ) : (
            `Preencha todos os ${TOTAL_CELLS} campos para enviar`
          )}
        </p>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Atividade'
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Submitted View ── */

interface SubmittedWellBeingDiaryViewProps {
  content: string;
}

function parseDiaryContent(content: string): DiaryData | null {
  try {
    const dayBlocks = content.split('---').map(b => b.trim()).filter(Boolean);
    const data: DiaryData = [];

    for (const block of dayBlocks) {
      if (block.startsWith('###')) continue; // skip header
      const physical = block.match(/\*\*Saúde Física:\*\*\s*(.*)/)?.[1]?.trim() ?? '';
      const mental = block.match(/\*\*Saúde Mental:\*\*\s*(.*)/)?.[1]?.trim() ?? '';
      const spiritual = block.match(/\*\*Saúde Espiritual:\*\*\s*(.*)/)?.[1]?.trim() ?? '';
      if (physical || mental || spiritual) {
        data.push([physical, mental, spiritual]);
      }
    }

    return data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export function SubmittedWellBeingDiaryView({ content }: SubmittedWellBeingDiaryViewProps) {
  const isMobile = useIsMobile();
  const parsed = parseDiaryContent(content);

  if (!parsed) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {parsed.map((row, dayIdx) => (
          <div
            key={dayIdx}
            className={`rounded-lg border border-primary/20 p-4 space-y-2 ${
              dayIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'
            }`}
          >
            <span className="text-sm font-semibold text-primary">{dayIdx + 1}º DIA</span>
            {DIMENSIONS.map((dim, dimIdx) => (
              <div key={dimIdx}>
                <p className="text-xs text-muted-foreground font-medium">{dim}</p>
                <p className="text-sm text-foreground">{row[dimIdx] || '—'}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-primary text-accent">
            <th className="px-4 py-3 text-left text-sm font-semibold w-[100px]">Dia</th>
            {DIMENSIONS.map(dim => (
              <th key={dim} className="px-4 py-3 text-left text-sm font-semibold">{dim}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.map((row, dayIdx) => (
            <tr key={dayIdx} className={dayIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'}>
              <td className="px-4 py-3 font-semibold text-primary text-sm whitespace-nowrap">
                {dayIdx + 1}º DIA
              </td>
              {row.map((val, dimIdx) => (
                <td key={dimIdx} className="px-4 py-3 text-sm text-foreground">
                  {val || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
