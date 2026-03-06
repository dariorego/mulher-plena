import { useState } from 'react';
import { createTreeStructure, type Ancestor } from './FamilyTreeActivity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import arvoreImg from '@/assets/arvore-ancestral.jpg';

interface SubmittedFamilyTreeViewProps {
  content: string;
}

const RELATION_TO_ID: Record<string, number> = {
  'Você': 0,
  'Mãe': 1,
  'Pai': 2,
  'Avó Materna': 3,
  'Avô Materno': 4,
  'Avó Paterna': 5,
  'Avô Paterno': 6,
  'Bisavó (mãe da Avó Materna)': 7,
  'Bisavô (pai da Avó Materna)': 8,
  'Bisavó (mãe do Avô Materno)': 9,
  'Bisavô (pai do Avô Materno)': 10,
  'Bisavó (mãe da Avó Paterna)': 11,
  'Bisavô (pai da Avó Paterna)': 12,
  'Bisavó (mãe do Avô Paterno)': 13,
  'Bisavô (pai do Avô Paterno)': 14,
};

const LEVEL_COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
const LEVEL_LABELS = ['Você', 'Pais', 'Avós', 'Bisavós'];

function parseFamilyTreeContent(content: string): Ancestor[] {
  const base = createTreeStructure('Você');
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^- \*\*(.+?):\*\*\s*(.+)$/);
    if (!match) continue;
    const [, relation, name] = match;
    const id = RELATION_TO_ID[relation.trim()];
    if (id !== undefined) {
      const ancestor = base.find(a => a.id === id);
      if (ancestor) ancestor.name = name.trim();
    }
  }
  return base;
}

// Numbered button node positioned absolutely over the image
function NumberedNode({ 
  number, 
  ancestor, 
  onClick,
  level,
}: { 
  number: number; 
  ancestor: Ancestor; 
  onClick: () => void;
  level: number;
}) {
  const isFilled = ancestor.name.trim() !== '';
  const isRoot = level === 0;
  const color = LEVEL_COLORS[level];

  const sizeClass = isRoot
    ? 'w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-base'
    : level === 1
      ? 'w-9 h-9 text-xs sm:w-10 sm:h-10 sm:text-sm'
      : level === 2
        ? 'w-7 h-7 text-[10px] sm:w-9 sm:h-9 sm:text-xs'
        : 'w-6 h-6 text-[9px] sm:w-7 sm:h-7 sm:text-[10px]';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClass} rounded-full font-bold flex items-center justify-center
        border-2 transition-all duration-200 cursor-pointer
        hover:scale-110 hover:shadow-lg active:scale-95
        ${isRoot 
          ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-md' 
          : isFilled 
            ? 'bg-white shadow-sm' 
            : 'bg-white/60 border-dashed'
        }
      `}
      style={!isRoot ? { borderColor: color, color: isFilled ? '#3E2723' : color } : undefined}
    >
      {number}
    </button>
  );
}

export function SubmittedFamilyTreeView({ content }: SubmittedFamilyTreeViewProps) {
  const ancestors = parseFamilyTreeContent(content);
  const [selected, setSelected] = useState<Ancestor | null>(null);

  const getByLevel = (level: number) => ancestors.filter(a => a.level === level);
  const getNumber = (id: number) => id + 1;

  return (
    <div className="space-y-4">
      {/* Tree with image background */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Background image */}
        <img 
          src={arvoreImg} 
          alt="Árvore de Ancestrais" 
          className="w-full h-auto rounded-2xl"
        />
        
        {/* Overlay with positioned nodes */}
        <div className="absolute inset-0 flex flex-col items-center">
          {/* Level 0 - top of tree */}
          <div className="absolute flex justify-center" style={{ top: 'calc(24% - 60px)' }}>
            {getByLevel(0).map(a => (
              <NumberedNode key={a.id} number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} level={0} />
            ))}
          </div>

          {/* Level 1 */}
          <div className="absolute flex justify-center gap-6 sm:gap-10" style={{ top: 'calc(38% - 60px)' }}>
            {getByLevel(1).map(a => (
              <NumberedNode key={a.id} number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} level={1} />
            ))}
          </div>

          {/* Level 2 */}
          <div className="absolute flex justify-center gap-2 sm:gap-4" style={{ top: 'calc(52% - 60px)' }}>
            {getByLevel(2).map(a => (
              <NumberedNode key={a.id} number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} level={2} />
            ))}
          </div>

          {/* Level 3 */}
          <div className="absolute flex justify-center gap-[2px] sm:gap-2" style={{ top: 'calc(65% - 60px)' }}>
            {getByLevel(3).map(a => (
              <NumberedNode key={a.id} number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} level={3} />
            ))}
          </div>
        </div>
      </div>

      {/* Names List Below */}
      <div className="rounded-xl border border-primary/10 bg-muted/30 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Users className="h-4 w-4" />
          Membros da Árvore
        </h4>
        {[0, 1, 2, 3].map(level => {
          const members = getByLevel(level).filter(a => a.name.trim());
          if (members.length === 0) return null;
          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: LEVEL_COLORS[level] }}
                >
                  {LEVEL_LABELS[level]}
                </span>
              </div>
              <div className="space-y-1 pl-2">
                {members.map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <span 
                      className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: LEVEL_COLORS[level] }}
                    >
                      {getNumber(a.id)}
                    </span>
                    <span className="text-foreground">
                      <strong className="text-[#5D4037]">{a.relation}:</strong> {a.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span 
                className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: selected ? LEVEL_COLORS[selected.level] : '#888' }}
              >
                {selected ? getNumber(selected.id) : ''}
              </span>
              {selected?.relation}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-lg font-semibold text-foreground">
              {selected?.name?.trim() || <span className="text-muted-foreground italic">Não preenchido</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {LEVEL_LABELS[selected?.level ?? 0]} • Posição {selected ? getNumber(selected.id) : ''}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
