import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [selectedEntry, setSelectedEntry] = useState<LoveActionEntry | null>(null);

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
                <th className="px-4 py-3 text-left text-sm font-semibold w-[22%]">Membro da Família</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Ação Realizada</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sensação ou Sentimento</th>
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
                  <td className="px-4 py-3 font-medium text-primary">{entry.member}</td>
                  <td className="px-4 py-3 text-muted-foreground line-clamp-2">{entry.action}</td>
                  <td className="px-4 py-3 text-muted-foreground line-clamp-2">{entry.feeling}</td>
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
              <span className="font-medium text-primary">{entry.member}</span>
              <p className="text-sm text-muted-foreground line-clamp-1">
                <strong>Ação:</strong> {entry.action}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                <strong>Sentimento:</strong> {entry.feeling}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de detalhe */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-cinzel">{selectedEntry?.member}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Ação Realizada</p>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedEntry?.action}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sensação ou Sentimento</p>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedEntry?.feeling}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
