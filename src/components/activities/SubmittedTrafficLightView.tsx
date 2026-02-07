import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ParsedRelationship {
  name: string;
  keyword: string;
  red: string;
  yellow: string;
  green: string;
}

function parseTrafficLightContent(content: string): ParsedRelationship[] {
  const relationships: ParsedRelationship[] = [];
  const blocks = content.split('---').filter(b => b.trim());

  for (const block of blocks) {
    const nameMatch = block.match(/\*\*Relacionamento:\s*(.+?)\*\*/);
    const keywordMatch = block.match(/\*\*Palavra-chave:\*\*\s*(.+)/);
    const redMatch = block.match(/- Vermelho \(Parar\):\s*(.+)/);
    const yellowMatch = block.match(/- Amarelo \(Aten[çc][ãa]o\):\s*(.+)/);
    const greenMatch = block.match(/- Verde \(Seguir\):\s*(.+)/);

    if (nameMatch) {
      relationships.push({
        name: nameMatch[1].trim(),
        keyword: keywordMatch?.[1]?.trim() || '',
        red: redMatch?.[1]?.trim() || '',
        yellow: yellowMatch?.[1]?.trim() || '',
        green: greenMatch?.[1]?.trim() || '',
      });
    }
  }

  return relationships;
}

interface SubmittedTrafficLightViewProps {
  content: string;
}

export function SubmittedTrafficLightView({ content }: SubmittedTrafficLightViewProps) {
  const relationships = parseTrafficLightContent(content);
  const [selected, setSelected] = useState<ParsedRelationship | null>(null);

  if (relationships.length === 0) {
    return <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relationships.map((rel, i) => (
          <button
            key={i}
            onClick={() => setSelected(rel)}
            className="text-left p-4 rounded-lg border border-border/50 bg-background hover:bg-muted/50 transition-colors space-y-3 cursor-pointer"
          >
            <div>
              <p className="font-semibold text-foreground">{rel.name}</p>
              <p className="text-xs text-muted-foreground italic">"{rel.keyword}"</p>
            </div>

            {/* Traffic light mini */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-foreground truncate">{rel.red}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                <p className="text-xs text-foreground truncate">{rel.yellow}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <p className="text-xs text-foreground truncate">{rel.green}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.name}
              <span className="text-sm font-normal text-muted-foreground italic">— "{selected?.keyword}"</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 mt-0.5 shadow-md shadow-red-500/30" />
              <div>
                <p className="text-sm font-medium text-red-700">Parar</p>
                <p className="text-sm text-foreground">{selected?.red}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5 shadow-md shadow-yellow-500/30" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Prestar atenção</p>
                <p className="text-sm text-foreground">{selected?.yellow}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5 shadow-md shadow-green-500/30" />
              <div>
                <p className="text-sm font-medium text-green-700">Seguir</p>
                <p className="text-sm text-foreground">{selected?.green}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
