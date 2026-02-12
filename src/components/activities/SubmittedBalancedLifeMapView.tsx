import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface LifeAreaEntry {
  area: string;
  dreams: string;
  goals: string;
}

interface SubmittedBalancedLifeMapViewProps {
  content: string;
}

const PRATICA_DOUTRINARIA = 'Durante 7 dias, escreva diariamente 5 frases de autoafirmação para si mesma. Utilize seu caderno de estudos ou bloco de anotações. As frases devem ser positivas, no tempo presente e refletir estados ou qualidades que você deseja fortalecer. Escolha um momento tranquilo, leia cada frase em voz baixa ou mentalmente e permita-se sentir o significado de cada uma.';

function parseBalancedLifeMap(content: string): LifeAreaEntry[] {
  const entries: LifeAreaEntry[] = [];
  const blocks = content.split('---').filter((b) => b.trim());

  for (const block of blocks) {
    const areaMatch = block.match(/\*\*(?:Área|Area):\*\*\s*(.+)/);
    const dreamsMatch = block.match(/\*\*Sonhos e Projetos:\*\*\s*(.+)/);
    const goalsMatch = block.match(/\*\*Metas:\*\*\s*([\s\S]*?)$/m);

    if (areaMatch && dreamsMatch && goalsMatch) {
      entries.push({
        area: areaMatch[1].trim(),
        dreams: dreamsMatch[1].trim(),
        goals: goalsMatch[1].trim(),
      });
    }
  }

  return entries;
}

export function SubmittedBalancedLifeMapView({ content }: SubmittedBalancedLifeMapViewProps) {
  const isMobile = useIsMobile();
  const entries = parseBalancedLifeMap(content);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return <p className="whitespace-pre-wrap text-sm">{content}</p>;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <div className="space-y-3">
        {!isMobile ? (
          <div className="rounded-lg border border-primary/20 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-accent">
                  <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Área da Vida</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Sonhos e Projetos</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Metas</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <>
                    <tr
                      key={`row-${index}`}
                      className={`cursor-pointer transition-colors hover:bg-accent/10 ${
                        index % 2 === 0 ? 'bg-cream/30' : 'bg-background'
                      } ${expandedIndex === index ? 'bg-accent/10' : ''}`}
                      onClick={() => toggleExpand(index)}
                    >
                      <td className="px-4 py-3 font-medium text-primary">{entry.area}</td>
                      <td className="px-4 py-3 text-muted-foreground">{expandedIndex === index ? '' : <span className="line-clamp-2">{entry.dreams}</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{expandedIndex === index ? '' : <span className="line-clamp-2">{entry.goals}</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>
                    {expandedIndex === index && (
                      <tr key={`detail-${index}`}>
                        <td colSpan={4} className="px-6 py-4 bg-accent/5 border-t border-primary/10">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sonhos e Projetos</p>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.dreams}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Metas</p>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.goals}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={index}
                className={`rounded-lg border border-primary/20 p-4 space-y-2 cursor-pointer transition-colors hover:bg-accent/10 ${
                  index % 2 === 0 ? 'bg-cream/30' : 'bg-background'
                }`}
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary">{entry.area}</span>
                  {expandedIndex === index ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
                {expandedIndex === index ? (
                  <div className="pt-2 border-t border-primary/10 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sonhos e Projetos</p>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{entry.dreams}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Metas</p>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{entry.goals}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-1"><strong>Sonhos:</strong> {entry.dreams}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1"><strong>Metas:</strong> {entry.goals}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sugestão de Prática Doutrinária */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Sugestão de Prática Doutrinária
          </h3>
        </div>
        <p className="text-muted-foreground leading-relaxed text-xs">
          {PRATICA_DOUTRINARIA}
        </p>
      </div>
    </>
  );
}
