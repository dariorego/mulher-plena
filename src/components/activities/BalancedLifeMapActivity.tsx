import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus, Trash2, Loader2, CheckCircle, Sparkles } from 'lucide-react';

interface LifeAreaEntry {
  area: string;
  dreams: string;
  goals: string;
}

interface BalancedLifeMapActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const MIN_ENTRIES = 3;

const PLACEHOLDERS = [
  { area: 'Ex: Convivência Familiar', dreams: 'Ex: Momentos de qualidade em família', goals: 'Ex: Reservar 1h por dia para a família' },
  { area: 'Ex: Vida Profissional', dreams: 'Ex: Crescimento na carreira', goals: 'Ex: Fazer um curso de gestão' },
  { area: 'Ex: Saúde e Bem-estar', dreams: 'Ex: Rotina saudável e equilibrada', goals: 'Ex: Praticar exercícios 3x por semana' },
  { area: 'Ex: Espiritualidade', dreams: 'Ex: Conexão interior e paz', goals: 'Ex: Meditar 10 minutos diariamente' },
];

const createEmptyEntry = (): LifeAreaEntry => ({ area: '', dreams: '', goals: '' });

const isEntryComplete = (entry: LifeAreaEntry) =>
  entry.area.trim() !== '' && entry.dreams.trim() !== '' && entry.goals.trim() !== '';

const PRATICA_DOUTRINARIA = 'Durante 7 dias, escreva diariamente 5 frases de autoafirmação para si mesma. Utilize seu caderno de estudos ou bloco de anotações. As frases devem ser positivas, no tempo presente e refletir estados ou qualidades que você deseja fortalecer. Escolha um momento tranquilo, leia cada frase em voz baixa ou mentalmente e permita-se sentir o significado de cada uma.';

export function BalancedLifeMapActivity({ description, onSubmit, isSubmitting, fontSizeClass }: BalancedLifeMapActivityProps) {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<LifeAreaEntry[]>([
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
  ]);

  const updateEntry = (index: number, field: keyof LifeAreaEntry, value: string) => {
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
    const header = '### Mapa de Vida Equilibrada\n\n---\n\n';
    const body = entries
      .filter(isEntryComplete)
      .map(
        (e) =>
          `**Área:** ${e.area}\n**Sonhos e Projetos:** ${e.dreams}\n**Metas:** ${e.goals}`
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

      {/* Label da tabela */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Mapa de Vida</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Desktop: Tabela */}
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Área da Vida</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Sonhos e Projetos</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Metas</th>
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
                      value={entry.area}
                      onChange={(e) => updateEntry(index, 'area', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.area || 'Área da vida'}
                      className="border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={entry.dreams}
                      onChange={(e) => updateEntry(index, 'dreams', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.dreams || 'Seus sonhos e projetos'}
                      rows={2}
                      className="resize-none border-primary/20 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={entry.goals}
                      onChange={(e) => updateEntry(index, 'goals', e.target.value)}
                      placeholder={PLACEHOLDERS[index]?.goals || 'Metas concretas'}
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
                <span className="text-sm font-semibold text-primary">Área {index + 1}</span>
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
                <label className="text-xs text-muted-foreground font-medium">Área da Vida</label>
                <Input
                  value={entry.area}
                  onChange={(e) => updateEntry(index, 'area', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.area || 'Área da vida'}
                  className="border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Sonhos e Projetos</label>
                <Textarea
                  value={entry.dreams}
                  onChange={(e) => updateEntry(index, 'dreams', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.dreams || 'Seus sonhos e projetos'}
                  rows={2}
                  className="resize-none border-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Metas</label>
                <Textarea
                  value={entry.goals}
                  onChange={(e) => updateEntry(index, 'goals', e.target.value)}
                  placeholder={PLACEHOLDERS[index]?.goals || 'Metas concretas'}
                  rows={2}
                  className="resize-none border-primary/20 bg-background"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar área */}
      <Button
        type="button"
        variant="outline"
        onClick={addEntry}
        className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Área
      </Button>

      {/* Contador */}
      <p className="text-xs text-center text-muted-foreground">
        {canSubmit ? (
          <span className="text-green-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" /> {completedCount}/{entries.length} áreas preenchidas
          </span>
        ) : (
          `${completedCount}/${MIN_ENTRIES} áreas preenchidas (mínimo ${MIN_ENTRIES})`
        )}
      </p>

      {/* Sugestão de Prática Doutrinária */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Sugestão de Prática Doutrinária
          </h3>
        </div>
        <p className="text-foreground leading-relaxed text-sm">
          {PRATICA_DOUTRINARIA}
        </p>
      </div>

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
