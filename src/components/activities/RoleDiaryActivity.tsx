import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

interface RoleEntry {
  role: string;
  feeling: string;
  experience: string;
}

interface RoleDiaryActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const MIN_ENTRIES = 3;

const createEmptyEntry = (): RoleEntry => ({ role: '', feeling: '', experience: '' });

const isEntryComplete = (entry: RoleEntry) =>
  entry.role.trim() !== '' && entry.feeling.trim() !== '' && entry.experience.trim() !== '';

export function RoleDiaryActivity({ description, onSubmit, isSubmitting, fontSizeClass }: RoleDiaryActivityProps) {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<RoleEntry[]>([
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
  ]);

  const updateEntry = (index: number, field: keyof RoleEntry, value: string) => {
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
    const header = '### Diário de Papéis\n\n---\n\n';
    const body = entries
      .filter(isEntryComplete)
      .map(
        (e) =>
          `**Papel:** ${e.role}\n**Sentimento:** ${e.feeling}\n**Como vivenciei:** ${e.experience}`
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
          <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>{description}</p>
        </div>
      )}

      {/* Label da tabela */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Diário de Papéis</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Desktop: Tabela */}
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Papel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Sentimento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Como vivenciei essa experiência</th>
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
                      value={entry.role}
                      onChange={(e) => updateEntry(index, 'role', e.target.value)}
                      placeholder="Ex: Mãe"
                      className="border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={entry.feeling}
                      onChange={(e) => updateEntry(index, 'feeling', e.target.value)}
                      placeholder="Ex: Amor"
                      className="border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={entry.experience}
                      onChange={(e) => updateEntry(index, 'experience', e.target.value)}
                      placeholder="Descreva como vivenciou essa experiência..."
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
                <span className="text-sm font-semibold text-primary">Papel {index + 1}</span>
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
                <label className="text-xs text-muted-foreground font-medium">Papel</label>
                <Input
                  value={entry.role}
                  onChange={(e) => updateEntry(index, 'role', e.target.value)}
                  placeholder="Ex: Mãe / cuidadora"
                  className="border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Sentimento</label>
                <Input
                  value={entry.feeling}
                  onChange={(e) => updateEntry(index, 'feeling', e.target.value)}
                  placeholder="Ex: Amor"
                  className="border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Como vivenciei essa experiência</label>
                <Textarea
                  value={entry.experience}
                  onChange={(e) => updateEntry(index, 'experience', e.target.value)}
                  placeholder="Descreva como vivenciou..."
                  rows={2}
                  className="resize-none border-primary/20 bg-background"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar papel */}
      <Button
        type="button"
        variant="outline"
        onClick={addEntry}
        className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Papel
      </Button>

      {/* Contador + Botão enviar */}
      <div className="space-y-3">
        <p className="text-xs text-center text-muted-foreground">
          {canSubmit ? (
            <span className="text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> {completedCount}/{entries.length} papéis preenchidos
            </span>
          ) : (
            `${completedCount}/${MIN_ENTRIES} papéis preenchidos (mínimo ${MIN_ENTRIES})`
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
