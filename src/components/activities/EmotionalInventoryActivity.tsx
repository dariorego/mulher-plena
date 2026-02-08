import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, CheckCircle } from 'lucide-react';

const ROWS = 3;
const COLUMNS = ['Emoção', 'Ação prática para ressignificar'] as const;
const TOTAL_CELLS = ROWS * COLUMNS.length;

type InventoryData = string[][];

const createEmptyInventory = (): InventoryData =>
  Array.from({ length: ROWS }, () => Array(COLUMNS.length).fill(''));

interface EmotionalInventoryActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const formatMarkdown = (data: InventoryData): string => {
  const header = '### Inventário Emocional\n\n';
  const rows = data
    .map(
      (row, i) =>
        `**${i + 1}ª Emoção**\n- **Emoção:** ${row[0]}\n- **Ação prática para ressignificar:** ${row[1]}`
    )
    .join('\n\n---\n\n');
  return header + rows;
};

export function EmotionalInventoryActivity({ description, onSubmit, isSubmitting, fontSizeClass }: EmotionalInventoryActivityProps) {
  const isMobile = useIsMobile();
  const [inventory, setInventory] = useState<InventoryData>(createEmptyInventory);

  const updateCell = (row: number, col: number, value: string) => {
    setInventory(prev => {
      const copy = prev.map(r => [...r]);
      copy[row][col] = value;
      return copy;
    });
  };

  const filledCount = inventory.flat().filter(v => v.trim() !== '').length;
  const canSubmit = filledCount === TOTAL_CELLS;
  const progressPercent = Math.round((filledCount / TOTAL_CELLS) * 100);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(formatMarkdown(inventory));
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

      {/* Exemplo */}
      <div className="bg-accent/10 border-l-4 border-accent p-5 rounded-r-lg space-y-2">
        <p className={`text-primary font-medium ${fontSizeClass}`}>💡 Exemplo:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground font-medium">Emoção:</span>{' '}
            <span className="text-foreground">Tristeza</span>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Ação prática:</span>{' '}
            <span className="text-foreground">Praticar a gratidão diária, anotando ao menos três motivos de agradecimento.</span>
          </div>
        </div>
      </div>

      {/* Label da tabela */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Inventário Emocional</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Desktop: Tabela */}
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[60px]">#</th>
                {COLUMNS.map(col => (
                  <th key={col} className="px-4 py-3 text-left text-sm font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'}>
                  <td className="px-4 py-3 font-semibold text-primary text-sm whitespace-nowrap">
                    {rowIdx + 1}
                  </td>
                  {row.map((val, colIdx) => (
                    <td key={colIdx} className="px-4 py-3">
                      <Input
                        value={val}
                        onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                        placeholder={colIdx === 0 ? 'Ex: Tristeza' : 'Ex: Praticar a gratidão diária...'}
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
        /* Mobile: Cartões empilhados */
        <div className="space-y-4">
          {inventory.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`rounded-lg border border-primary/20 p-4 space-y-3 ${
                rowIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'
              }`}
            >
              <span className="text-sm font-semibold text-primary">{rowIdx + 1}ª Emoção</span>
              {COLUMNS.map((col, colIdx) => (
                <div key={colIdx} className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">{col}</label>
                  <Input
                    value={row[colIdx]}
                    onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                    placeholder={colIdx === 0 ? 'Ex: Tristeza' : 'Ex: Praticar a gratidão diária...'}
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

interface SubmittedEmotionalInventoryViewProps {
  content: string;
}

function parseInventoryContent(content: string): InventoryData | null {
  try {
    const blocks = content.split('---').map(b => b.trim()).filter(Boolean);
    const data: InventoryData = [];

    for (const block of blocks) {
      if (block.startsWith('###')) continue;
      const emotion = block.match(/\*\*Emoção:\*\*\s*(.*)/)?.[1]?.trim() ?? '';
      const action = block.match(/\*\*Ação prática para ressignificar:\*\*\s*(.*)/)?.[1]?.trim() ?? '';
      if (emotion || action) {
        data.push([emotion, action]);
      }
    }

    return data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export function SubmittedEmotionalInventoryView({ content }: SubmittedEmotionalInventoryViewProps) {
  const isMobile = useIsMobile();
  const parsed = parseInventoryContent(content);

  if (!parsed) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {parsed.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`rounded-lg border border-primary/20 p-4 space-y-2 ${
              rowIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'
            }`}
          >
            <span className="text-sm font-semibold text-primary">{rowIdx + 1}ª Emoção</span>
            {COLUMNS.map((col, colIdx) => (
              <div key={colIdx}>
                <p className="text-xs text-muted-foreground font-medium">{col}</p>
                <p className="text-sm text-foreground">{row[colIdx] || '—'}</p>
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
            <th className="px-4 py-3 text-left text-sm font-semibold w-[60px]">#</th>
            {COLUMNS.map(col => (
              <th key={col} className="px-4 py-3 text-left text-sm font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-cream/30' : 'bg-background'}>
              <td className="px-4 py-3 font-semibold text-primary text-sm whitespace-nowrap">
                {rowIdx + 1}
              </td>
              {row.map((val, colIdx) => (
                <td key={colIdx} className="px-4 py-3 text-sm text-foreground">
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
