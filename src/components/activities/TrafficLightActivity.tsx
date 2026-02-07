import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

interface Relationship {
  name: string;
  keyword: string;
  red: string;
  yellow: string;
  green: string;
}

const emptyRelationship = (): Relationship => ({
  name: '',
  keyword: '',
  red: '',
  yellow: '',
  green: '',
});

const isRelationshipComplete = (r: Relationship) =>
  r.name.trim() && r.keyword.trim() && r.red.trim() && r.yellow.trim() && r.green.trim();

interface TrafficLightActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

export function TrafficLightActivity({ description, onSubmit, isSubmitting, fontSizeClass }: TrafficLightActivityProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([
    emptyRelationship(),
    emptyRelationship(),
    emptyRelationship(),
  ]);

  const updateRelationship = (index: number, field: keyof Relationship, value: string) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], [field]: value };
    setRelationships(updated);
  };

  const addRelationship = () => {
    setRelationships([...relationships, emptyRelationship()]);
  };

  const removeRelationship = (index: number) => {
    if (relationships.length <= 3) return;
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const completedCount = relationships.filter(isRelationshipComplete).length;
  const canSubmit = completedCount >= 3;

  const formatContent = () => {
    const header = '### Farol das Ações nos Relacionamentos\n\n---\n\n';
    const body = relationships
      .filter(isRelationshipComplete)
      .map(r =>
        `**Relacionamento: ${r.name}**\n**Palavra-chave:** ${r.keyword}\n\n- Vermelho (Parar): ${r.red}\n- Amarelo (Atenção): ${r.yellow}\n- Verde (Seguir): ${r.green}`
      )
      .join('\n\n---\n\n');
    return header + body;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(formatContent());
  };

  return (
    <div className="space-y-6">
      {/* Orientação */}
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

      {/* Relacionamentos */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seus Relacionamentos</span>
        <div className="flex-1 h-px bg-primary/20"></div>
      </div>

      {relationships.map((rel, index) => (
        <Card key={index} className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-cinzel text-accent">
              Relacionamento {index + 1}
            </CardTitle>
            {relationships.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => removeRelationship(index)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome e Palavra-chave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-primary/80 font-medium">Nome do relacionamento</Label>
                <Input
                  value={rel.name}
                  onChange={e => updateRelationship(index, 'name', e.target.value)}
                  placeholder="Ex: Família, Amigos..."
                  className="border-primary/20 focus:border-primary bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-primary/80 font-medium">Palavra-chave</Label>
                <Input
                  value={rel.keyword}
                  onChange={e => updateRelationship(index, 'keyword', e.target.value)}
                  placeholder="Ex: Amor, Lealdade..."
                  className="border-primary/20 focus:border-primary bg-background"
                />
              </div>
            </div>

            {/* Semáforo */}
            <div className="space-y-3">
              {/* Vermelho */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-500 shadow-md shadow-red-500/30" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-medium text-red-700">Algo para PARAR</Label>
                  <Textarea
                    value={rel.red}
                    onChange={e => updateRelationship(index, 'red', e.target.value)}
                    placeholder="O que você precisa parar de fazer nesse relacionamento?"
                    rows={2}
                    className="resize-none border-red-200 focus:border-red-400 bg-red-50/30"
                  />
                </div>
              </div>

              {/* Amarelo */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 shadow-md shadow-yellow-500/30" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-medium text-yellow-700">Algo para PRESTAR ATENÇÃO</Label>
                  <Textarea
                    value={rel.yellow}
                    onChange={e => updateRelationship(index, 'yellow', e.target.value)}
                    placeholder="O que merece mais atenção nesse relacionamento?"
                    rows={2}
                    className="resize-none border-yellow-200 focus:border-yellow-400 bg-yellow-50/30"
                  />
                </div>
              </div>

              {/* Verde */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500 shadow-md shadow-green-500/30" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-medium text-green-700">Algo para SEGUIR</Label>
                  <Textarea
                    value={rel.green}
                    onChange={e => updateRelationship(index, 'green', e.target.value)}
                    placeholder="O que você deve continuar fazendo nesse relacionamento?"
                    rows={2}
                    className="resize-none border-green-200 focus:border-green-400 bg-green-50/30"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Adicionar */}
      <Button variant="outline" onClick={addRelationship} className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5">
        <Plus className="h-4 w-4 mr-2" /> Adicionar Relacionamento
      </Button>

      {/* Status e Enviar */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          {canSubmit ? (
            <span className="text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> {completedCount} relacionamento(s) preenchido(s)
            </span>
          ) : (
            `${completedCount}/3 relacionamentos completos (mínimo 3)`
          )}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
            </>
          ) : (
            'Enviar Atividade'
          )}
        </Button>
      </div>
    </div>
  );
}
