import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

interface LoveActionEntry {
  member: string;
  action: string;
  feeling: string;
}

interface LoveActionActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const MIN_ENTRIES = 1;

const PLACEHOLDERS = [
  { member: 'Ex: Minha mãe', action: 'Ex: Preparei um café da manhã especial', feeling: 'Ex: Senti gratidão e alegria' },
  { member: 'Ex: Meu irmão', action: 'Ex: Liguei para perguntar como ele estava', feeling: 'Ex: Me senti mais conectada' },
];

const createEmptyEntry = (): LoveActionEntry => ({ member: '', action: '', feeling: '' });

const isEntryComplete = (entry: LoveActionEntry) =>
  entry.member.trim() !== '' && entry.action.trim() !== '' && entry.feeling.trim() !== '';

export function LoveActionActivity({ description, onSubmit, isSubmitting, fontSizeClass }: LoveActionActivityProps) {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<LoveActionEntry[]>([
    createEmptyEntry(),
    createEmptyEntry(),
  ]);

  const updateEntry = (index: number, field: keyof LoveActionEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= MIN_ENTRIES) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const completedCount = entries.filter(isEntryComplete).length;
  const canSubmit = completedCount >= MIN_ENTRIES;

  const formatMarkdown = (): string => {
    const header = '### Ação de Amor Concreta\n\n---\n\n';
    const body = entries
      .filter(isEntryComplete)
      .map(
        (e) =>
          `**Membro da Família:** ${e.member}\n**Ação Realizada:** ${e.action}\n**Sensação ou Sentimento:** ${e.feeling}`
      )
      .join('\n\n---\n\n');
    return header + body;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(formatMarkdown());
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
            className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Tabela ilustrativa de referência */}
      <div className="rounded-lg border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-accent">
              <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Membro da Família</th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Ação realizada</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Registre a sensação ou sentimento</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-cream/30">
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
            </tr>
            <tr className="bg-background">
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
              <td className="px-4 py-4 text-muted-foreground/40 text-sm italic">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Label da tabela */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seus Registros</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Desktop: Tabela */}
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Membro da Família</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Ação Realizada</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sensação ou Sentimento</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-cream/30' : 'bg-background'}
                >
                  <td className="px-4 py-3">
                    <Input
                      value={entry.member}
                      onChange={(e) => updateEntry(index, 'member', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.member || 'Membro da família'}
                      className="border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={entry.action}
                      onChange={(e) => updateEntry(index, 'action', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.action || 'Descreva a ação realizada'}
                      rows={2}
                      className="resize-none border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={entry.feeling}
                      onChange={(e) => updateEntry(index, 'feeling', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.feeling || 'Registre a sensação ou sentimento'}
                      rows={2}
                      className="resize-none border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-2 py-3">
                    {entries.length > MIN_ENTRIES && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile: Cartões empilhados */
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`rounded-lg border border-primary/20 p-4 space-y-3 ${
                index % 2 === 0 ? 'bg-cream/30' : 'bg-background'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Registro {index + 1}</span>
                {entries.length > MIN_ENTRIES && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Membro da Família</label>
                <Input
                  value={entry.member}
                  onChange={(e) => updateEntry(index, 'member', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.member || 'Membro da família'}
                  className="border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Ação Realizada</label>
                <Textarea
                  value={entry.action}
                  onChange={(e) => updateEntry(index, 'action', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.action || 'Descreva a ação realizada'}
                  rows={2}
                  className="resize-none border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Sensação ou Sentimento</label>
                <Textarea
                  value={entry.feeling}
                  onChange={(e) => updateEntry(index, 'feeling', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.feeling || 'Registre a sensação ou sentimento'}
                  rows={2}
                  className="resize-none border-primary/20 bg-background"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar registro */}
      <Button
        type="button"
        variant="outline"
        onClick={addEntry}
        className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Registro
      </Button>

      {/* Contador */}
      <p className="text-xs text-center text-muted-foreground">
        {canSubmit ? (
          <span className="text-green-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" /> {completedCount} registro(s) preenchido(s)
          </span>
        ) : (
          `Preencha pelo menos ${MIN_ENTRIES} registro completo para enviar`
        )}
      </p>

      {/* Botão enviar */}
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
  );
}
