import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoleEntry {
  role: string;
  feeling: string;
  experience: string;
}

interface SubmittedRoleDiaryViewProps {
  content: string;
}

function parseRoleDiary(content: string): RoleEntry[] {
  const entries: RoleEntry[] = [];
  const blocks = content.split('---').filter((b) => b.trim());

  for (const block of blocks) {
    const roleMatch = block.match(/\*\*Papel:\*\*\s*(.+)/);
    const feelingMatch = block.match(/\*\*Sentimento:\*\*\s*(.+)/);
    const expMatch = block.match(/\*\*Como vivenciei:\*\*\s*([\s\S]*?)$/m);

    if (roleMatch && feelingMatch && expMatch) {
      entries.push({
        role: roleMatch[1].trim(),
        feeling: feelingMatch[1].trim(),
        experience: expMatch[1].trim(),
      });
    }
  }

  return entries;
}

export function SubmittedRoleDiaryView({ content }: SubmittedRoleDiaryViewProps) {
  const isMobile = useIsMobile();
  const entries = parseRoleDiary(content);
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
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Papel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Sentimento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Como vivenciei</th>
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
                    <td className="px-4 py-3 font-medium text-primary">{entry.role}</td>
                    <td className="px-4 py-3">{entry.feeling}</td>
                    <td className="px-4 py-3 text-muted-foreground">{expandedIndex === index ? '' : <span className="line-clamp-2">{entry.experience}</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </td>
                  </tr>
                  {expandedIndex === index && (
                    <tr key={`detail-${index}`}>
                      <td colSpan={4} className="px-6 py-4 bg-accent/5 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Como vivenciei essa experiência</p>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.experience}</p>
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
                <span className="font-medium text-primary">{entry.role}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{entry.feeling}</span>
                  {expandedIndex === index ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
              {expandedIndex === index ? (
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Como vivenciei essa experiência</p>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{entry.experience}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-2">{entry.experience}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
