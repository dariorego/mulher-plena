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

function TrafficLightPole({ rel, onClick }: { rel: ParsedRelationship; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
    >
      {/* Name label */}
      <p className="font-semibold text-foreground text-sm mb-1 text-center">{rel.name}</p>
      <p className="text-xs text-muted-foreground italic mb-3 text-center">"{rel.keyword}"</p>

      {/* Traffic light body */}
      <div className="relative">
        <div className="w-28 bg-[hsl(0,0%,30%)] rounded-2xl p-3 space-y-3 shadow-lg border-2 border-[hsl(0,0%,22%)]">
          {/* Red light */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500 shadow-[0_0_18px_4px_rgba(239,68,68,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Parar</span>
            </div>
          </div>
          {/* Yellow light */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-yellow-400 shadow-[0_0_18px_4px_rgba(234,179,8,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Atenção</span>
            </div>
          </div>
          {/* Green light */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500 shadow-[0_0_18px_4px_rgba(34,197,94,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Seguir</span>
            </div>
          </div>
        </div>
        {/* Pole */}
        <div className="w-4 h-10 bg-[hsl(0,0%,35%)] mx-auto rounded-b-sm shadow-md" />
        <div className="w-12 h-3 bg-[hsl(0,0%,30%)] mx-auto rounded-full shadow-md" />
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Clique para detalhes
      </p>
    </button>
  );
}

export function SubmittedTrafficLightView({ content }: SubmittedTrafficLightViewProps) {
  const relationships = parseTrafficLightContent(content);
  const [selected, setSelected] = useState<ParsedRelationship | null>(null);

  if (relationships.length === 0) {
    return <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 py-4">
        {relationships.map((rel, i) => (
          <TrafficLightPole key={i} rel={rel} onClick={() => setSelected(rel)} />
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
          <div className="space-y-5 py-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0 mt-0.5 shadow-[0_0_12px_2px_rgba(239,68,68,0.4)]" />
              <div>
                <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Parar</p>
                <p className="text-sm text-foreground mt-0.5">{selected?.red}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0 mt-0.5 shadow-[0_0_12px_2px_rgba(234,179,8,0.4)]" />
              <div>
                <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Prestar atenção</p>
                <p className="text-sm text-foreground mt-0.5">{selected?.yellow}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 mt-0.5 shadow-[0_0_12px_2px_rgba(34,197,94,0.4)]" />
              <div>
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Seguir</p>
                <p className="text-sm text-foreground mt-0.5">{selected?.green}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
