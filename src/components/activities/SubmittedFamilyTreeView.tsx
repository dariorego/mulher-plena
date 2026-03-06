import { useState, useRef, useEffect } from 'react';
import { createTreeStructure, type Ancestor } from './FamilyTreeActivity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';

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

// Compact numbered node
function NumberedNode({ 
  number, 
  ancestor, 
  onClick,
  size = 'md'
}: { 
  number: number; 
  ancestor: Ancestor; 
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const isFilled = ancestor.name.trim() !== '';
  const isRoot = ancestor.level === 0;
  const color = LEVEL_COLORS[ancestor.level];
  
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-full font-bold flex items-center justify-center
        border-2 transition-all duration-200 cursor-pointer
        hover:scale-110 hover:shadow-lg active:scale-95
        ${isRoot 
          ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-md' 
          : isFilled 
            ? 'bg-white border-current text-current shadow-sm' 
            : 'bg-white/50 border-dashed border-white/70 text-white/70'
        }
      `}
      style={!isRoot ? { borderColor: color, color: isFilled ? '#3E2723' : undefined } : undefined}
    >
      {number}
    </button>
  );
}

// SVG lines between nodes
function SubmittedConnectionLines({ 
  containerRef,
  nodeRefs,
  ancestors 
}: { 
  containerRef: React.RefObject<HTMLDivElement>;
  nodeRefs: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
  ancestors: Ancestor[];
}) {
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const cr = containerRef.current.getBoundingClientRect();
      const newLines: typeof lines = [];

      ancestors.filter(a => a.parentIds.length > 0).forEach(child => {
        const childEl = nodeRefs.current.get(child.id);
        if (!childEl) return;
        const childRect = childEl.getBoundingClientRect();
        const cx = childRect.left + childRect.width / 2 - cr.left;
        const cy = childRect.bottom - cr.top;

        child.parentIds.forEach(pid => {
          const pEl = nodeRefs.current.get(pid);
          if (!pEl) return;
          const pr = pEl.getBoundingClientRect();
          newLines.push({
            x1: cx, y1: cy,
            x2: pr.left + pr.width / 2 - cr.left,
            y2: pr.top - cr.top
          });
        });
      });
      setLines(newLines);
    };

    const t = setTimeout(calc, 100);
    window.addEventListener('resize', calc);
    return () => { clearTimeout(t); window.removeEventListener('resize', calc); };
  }, [ancestors, containerRef, nodeRefs]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#8B4513" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function SubmittedFamilyTreeView({ content }: SubmittedFamilyTreeViewProps) {
  const ancestors = parseFamilyTreeContent(content);
  const [selected, setSelected] = useState<Ancestor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const t = setTimeout(() => forceUpdate({}), 50);
    return () => clearTimeout(t);
  }, []);

  const setNodeRef = (id: number) => (el: HTMLDivElement | null) => {
    nodeRefs.current.set(id, el);
  };

  const getByLevel = (level: number) => ancestors.filter(a => a.level === level);
  
  // Numbering: 1=Você, 2=Mãe, 3=Pai, 4-7=Avós, 8-15=Bisavós
  const getNumber = (id: number) => id + 1;

  const filledAncestors = ancestors.filter(a => a.name.trim() !== '');

  return (
    <div className="space-y-4">
      {/* Tree Visualization */}
      <div 
        className="rounded-2xl p-3 sm:p-5 border border-green-200 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)' }}
      >
        <h3 className="text-center text-sm font-semibold text-[#2E7D32] mb-3">
          🌲 Sua Árvore de Ancestrais
        </h3>
        <p className="text-center text-[10px] text-[#5D4037] mb-3">
          Toque em um número para ver o nome
        </p>

        {/* Tree */}
        <div className="relative">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #5D4037 0%, #3E2723 100%)',
              clipPath: 'polygon(50% 0%, 3% 100%, 97% 100%)',
            }}
          />
          <div 
            ref={containerRef}
            className="relative overflow-visible"
            style={{
              background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 40%, #0D4A0D 100%)',
              padding: '40px 20px 50px 20px',
              clipPath: 'polygon(50% 1%, 5% 99%, 95% 99%)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
            }}
          >
            <SubmittedConnectionLines containerRef={containerRef} nodeRefs={nodeRefs} ancestors={ancestors} />

            <div className="relative flex flex-col items-center gap-4 sm:gap-5" style={{ zIndex: 2 }}>
              <div className="text-amber-300 text-2xl sm:text-3xl -mt-2 drop-shadow-lg">⭐</div>

              {/* Level 0 */}
              <div className="flex justify-center">
                {getByLevel(0).map(a => (
                  <div key={a.id} ref={setNodeRef(a.id)}>
                    <NumberedNode number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} size="lg" />
                  </div>
                ))}
              </div>

              {/* Level 1 */}
              <div className="flex justify-center gap-6 sm:gap-10 mt-2">
                {getByLevel(1).map(a => (
                  <div key={a.id} ref={setNodeRef(a.id)}>
                    <NumberedNode number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} size="md" />
                  </div>
                ))}
              </div>

              {/* Level 2 */}
              <div className="flex justify-center gap-3 sm:gap-5 mt-2">
                {getByLevel(2).map(a => (
                  <div key={a.id} ref={setNodeRef(a.id)}>
                    <NumberedNode number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} size="md" />
                  </div>
                ))}
              </div>

              {/* Level 3 */}
              <div className="flex justify-center gap-1 sm:gap-2 mt-1">
                {getByLevel(3).map(a => (
                  <div key={a.id} ref={setNodeRef(a.id)}>
                    <NumberedNode number={getNumber(a.id)} ancestor={a} onClick={() => setSelected(a)} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trunk */}
        <div className="flex flex-col items-center -mt-1">
          <div className="w-8 h-8 rounded-b-lg" style={{ background: 'linear-gradient(180deg, #5D4037 0%, #3E2723 100%)' }} />
          <div className="w-24 h-2.5 -mt-1 rounded-full" style={{ background: 'linear-gradient(180deg, #6D4C41 0%, #4E342E 100%)' }} />
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
