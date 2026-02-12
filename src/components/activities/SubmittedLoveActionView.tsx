import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LoveActionEntry {
  member: string;
  action: string;
  feeling: string;
}

interface SubmittedLoveActionViewProps {
  content: string;
}

function parseLoveAction(content: string): LoveActionEntry[] {
  const entries: LoveActionEntry[] = [];
  const blocks = content.split('---').filter((b) => b.trim());

  for (const block of blocks) {
    const memberMatch = block.match(/\*\*Membro da Fam[íi]lia:\*\*\s*(.+)/);
    const actionMatch = block.match(/\*\*A[çc][ãa]o Realizada:\*\*\s*(.+)/);
    const feelingMatch = block.match(/\*\*Sensa[çc][ãa]o ou Sentimento:\*\*\s*([\s\S]*?)$/m);

    if (memberMatch && actionMatch && feelingMatch) {
      entries.push({
        member: memberMatch[1].trim(),
        action: actionMatch[1].trim(),
        feeling: feelingMatch[1].trim(),
      });
    }
  }

  return entries;
}

export function SubmittedLoveActionView({ content }: SubmittedLoveActionViewProps) {
  const isMobile = useIsMobile();
  const entries = parseLoveAction(content);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return <p className="whitespace-pre-wrap text-sm">{content}</p>;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Membro da Família</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Ação Realizada</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sensação ou Sentimento</th>
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
                    <td className="px-4 py-3 font-medium text-primary">{entry.member}</td>
                    <td className="px-4 py-3 text-muted-foreground">{expandedIndex === index ? '' : <span className="line-clamp-2">{entry.action}</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{expandedIndex === index ? '' : <span className="line-clamp-2">{entry.feeling}</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </td>
                  </tr>
                  {expandedIndex === index && (
                    <tr key={`detail-${index}`}>
                      <td colSpan={4} className="px-6 py-4 bg-accent/5 border-t border-primary/10">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Ação Realizada</p>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.action}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sensação ou Sentimento</p>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.feeling}</p>
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
                <span className="font-medium text-primary">{entry.member}</span>
                {expandedIndex === index ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              {expandedIndex === index ? (
                <div className="pt-2 border-t border-primary/10 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Ação Realizada</p>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{entry.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sensação ou Sentimento</p>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{entry.feeling}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground line-clamp-1"><strong>Ação:</strong> {entry.action}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1"><strong>Sentimento:</strong> {entry.feeling}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
