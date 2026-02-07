import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [selectedEntry, setSelectedEntry] = useState<RoleEntry | null>(null);

  if (entries.length === 0) {
    return <p className="whitespace-pre-wrap text-sm">{content}</p>;
  }

  return (
    <>
      {!isMobile ? (
        <div className="rounded-lg border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-accent">
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Papel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Sentimento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Como vivenciei</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={index}
                  className={`cursor-pointer transition-colors hover:bg-accent/10 ${
                    index % 2 === 0 ? 'bg-cream/30' : 'bg-background'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <td className="px-4 py-3 font-medium text-primary">{entry.role}</td>
                  <td className="px-4 py-3">{entry.feeling}</td>
                  <td className="px-4 py-3 text-muted-foreground line-clamp-2">{entry.experience}</td>
                </tr>
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
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary">{entry.role}</span>
                <span className="text-sm text-muted-foreground">{entry.feeling}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.experience}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de detalhe */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-cinzel">{selectedEntry?.role}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sentimento</p>
              <p className="text-foreground font-medium">{selectedEntry?.feeling}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Como vivenciei essa experiência</p>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedEntry?.experience}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
