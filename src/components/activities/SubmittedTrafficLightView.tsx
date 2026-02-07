import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ParsedRelationship {
  name: string;
  keyword: string;
  red: string;
  yellow: string;
  green: string;
}

type LightColor = 'red' | 'yellow' | 'green';

interface SelectedLight {
  rel: ParsedRelationship;
  color: LightColor;
}

const lightConfig: Record<LightColor, { label: string; textColor: string; bgClass: string; glowShadow: string }> = {
  red: {
    label: 'Parar',
    textColor: 'text-red-700',
    bgClass: 'bg-red-500',
    glowShadow: 'shadow-[0_0_16px_4px_rgba(239,68,68,0.5)]',
  },
  yellow: {
    label: 'Prestar atenção',
    textColor: 'text-yellow-700',
    bgClass: 'bg-yellow-400',
    glowShadow: 'shadow-[0_0_16px_4px_rgba(234,179,8,0.5)]',
  },
  green: {
    label: 'Seguir',
    textColor: 'text-green-700',
    bgClass: 'bg-green-500',
    glowShadow: 'shadow-[0_0_16px_4px_rgba(34,197,94,0.5)]',
  },
};

function getAnswer(rel: ParsedRelationship, color: LightColor): string {
  if (color === 'red') return rel.red;
  if (color === 'yellow') return rel.yellow;
  return rel.green;
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

function TrafficLightPole({ rel, onClickLight }: { rel: ParsedRelationship; onClickLight: (color: LightColor) => void }) {
  return (
    <div className="flex flex-col items-center">
      <p className="font-semibold text-foreground text-sm mb-1 text-center">{rel.name}</p>
      <p className="text-xs text-muted-foreground italic mb-3 text-center">"{rel.keyword}"</p>

      <div className="relative">
        <div className="w-28 bg-[hsl(0,0%,30%)] rounded-2xl p-3 space-y-3 shadow-lg border-2 border-[hsl(0,0%,22%)]">
          {/* Red light */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => onClickLight('red')}
              className="w-20 h-20 rounded-full bg-red-500 shadow-[0_0_18px_4px_rgba(239,68,68,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Parar</span>
            </button>
          </div>
          {/* Yellow light */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => onClickLight('yellow')}
              className="w-20 h-20 rounded-full bg-yellow-400 shadow-[0_0_18px_4px_rgba(234,179,8,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Atenção</span>
            </button>
          </div>
          {/* Green light */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => onClickLight('green')}
              className="w-20 h-20 rounded-full bg-green-500 shadow-[0_0_18px_4px_rgba(34,197,94,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <span className="text-white font-bold text-[10px] uppercase tracking-wide text-center leading-tight px-1">Seguir</span>
            </button>
          </div>
        </div>
        {/* Pole */}
        <div className="w-4 h-10 bg-[hsl(0,0%,35%)] mx-auto rounded-b-sm shadow-md" />
        <div className="w-12 h-3 bg-[hsl(0,0%,30%)] mx-auto rounded-full shadow-md" />
      </div>
    </div>
  );
}

export function SubmittedTrafficLightView({ content }: SubmittedTrafficLightViewProps) {
  const relationships = parseTrafficLightContent(content);
  const [selected, setSelected] = useState<SelectedLight | null>(null);

  if (relationships.length === 0) {
    return <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>;
  }

  const config = selected ? lightConfig[selected.color] : null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 py-4">
        {relationships.map((rel, i) => (
          <TrafficLightPole
            key={i}
            rel={rel}
            onClickLight={(color) => setSelected({ rel, color })}
          />
        ))}
      </div>

      {/* Single-color Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.rel.name}
              <span className="text-sm font-normal text-muted-foreground italic">— "{selected?.rel.keyword}"</span>
            </DialogTitle>
          </DialogHeader>
          {selected && config && (
            <div className="flex items-start gap-4 py-3">
              <div className={`w-10 h-10 rounded-full ${config.bgClass} flex-shrink-0 mt-0.5 ${config.glowShadow}`} />
              <div>
                <p className={`text-sm font-bold uppercase tracking-wide ${config.textColor}`}>{config.label}</p>
                <p className="text-sm text-foreground mt-1">{getAnswer(selected.rel, selected.color)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
