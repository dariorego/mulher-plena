import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { CheckCircle, TreeDeciduous, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Ancestor {
  id: number;
  level: number;
  relation: string;
  name: string;
  gender: 'M' | 'F' | null;
  parentIds: number[];
}

interface FamilyTreeActivityProps {
  description?: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

// Tree structure: 15 positions (1 + 2 + 4 + 8)
const createTreeStructure = (userName: string): Ancestor[] => [
  // Nível 0 - Você (raiz)
  { id: 0, level: 0, relation: 'Você', name: userName, gender: null, parentIds: [1, 2] },
  
  // Nível 1 - Pais (2)
  { id: 1, level: 1, relation: 'Mãe', name: '', gender: 'F', parentIds: [3, 4] },
  { id: 2, level: 1, relation: 'Pai', name: '', gender: 'M', parentIds: [5, 6] },
  
  // Nível 2 - Avós (4)
  { id: 3, level: 2, relation: 'Avó Materna', name: '', gender: 'F', parentIds: [7, 8] },
  { id: 4, level: 2, relation: 'Avô Materno', name: '', gender: 'M', parentIds: [9, 10] },
  { id: 5, level: 2, relation: 'Avó Paterna', name: '', gender: 'F', parentIds: [11, 12] },
  { id: 6, level: 2, relation: 'Avô Paterno', name: '', gender: 'M', parentIds: [13, 14] },
  
  // Nível 3 - Bisavós (8)
  { id: 7, level: 3, relation: 'Bisavó (mãe da Avó Materna)', name: '', gender: 'F', parentIds: [] },
  { id: 8, level: 3, relation: 'Bisavô (pai da Avó Materna)', name: '', gender: 'M', parentIds: [] },
  { id: 9, level: 3, relation: 'Bisavó (mãe do Avô Materno)', name: '', gender: 'F', parentIds: [] },
  { id: 10, level: 3, relation: 'Bisavô (pai do Avô Materno)', name: '', gender: 'M', parentIds: [] },
  { id: 11, level: 3, relation: 'Bisavó (mãe da Avó Paterna)', name: '', gender: 'F', parentIds: [] },
  { id: 12, level: 3, relation: 'Bisavô (pai da Avó Paterna)', name: '', gender: 'M', parentIds: [] },
  { id: 13, level: 3, relation: 'Bisavó (mãe do Avô Paterno)', name: '', gender: 'F', parentIds: [] },
  { id: 14, level: 3, relation: 'Bisavô (pai do Avô Paterno)', name: '', gender: 'M', parentIds: [] },
];

// Levels in visual order (inverted: Você at top, Bisavós at bottom)
const LEVELS_VISUAL = [
  { level: 0, title: 'Você', count: 1, color: '#4CAF50' },
  { level: 1, title: 'Pais', count: 2, color: '#FF9800' },
  { level: 2, title: 'Avós', count: 4, color: '#2196F3' },
  { level: 3, title: 'Bisavós', count: 8, color: '#9C27B0' },
];

// Levels for input forms (excluding Você)
const LEVELS_INPUT = [
  { level: 1, title: 'Pais', count: 2, color: '#FF9800' },
  { level: 2, title: 'Avós', count: 4, color: '#2196F3' },
  { level: 3, title: 'Bisavós', count: 8, color: '#9C27B0' },
];

// Tree node component
function TreeNode({ 
  ancestor, 
  isHighlighted,
  isRoot = false,
  isSmall = false
}: { 
  ancestor: Ancestor; 
  isHighlighted: boolean;
  isRoot?: boolean;
  isSmall?: boolean;
}) {
  const isFilled = ancestor.name.trim() !== '';
  const displayName = isFilled ? ancestor.name : (ancestor.gender === 'F' ? 'Desconhecida' : ancestor.gender === 'M' ? 'Desconhecido' : '?');
  const maxLen = isSmall ? 6 : 8;
  
  return (
    <div 
      className={`
        relative px-1.5 py-1 text-center rounded-lg border-2 
        transition-all duration-300 transform
        ${isSmall ? 'min-w-[45px] max-w-[52px]' : 'min-w-[55px] max-w-[70px]'}
        ${isRoot 
          ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-500 shadow-lg min-w-[70px]' 
          : isFilled 
            ? 'bg-white/95 border-[#8B4513] shadow-md' 
            : 'bg-white/60 border-dashed border-white/80'
        }
        ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-1 scale-110 z-10' : ''}
      `}
    >
      <div className={`${isSmall ? 'text-[7px]' : 'text-[8px]'} text-[#5D4037] font-medium truncate mb-0.5 leading-tight`}>
        {ancestor.relation.split(' ')[0]}
      </div>
      <div className={`${isSmall ? 'text-[8px]' : 'text-[9px]'} font-semibold truncate ${isFilled || isRoot ? 'text-[#3E2723]' : 'text-gray-400 italic'}`}>
        {displayName.length > maxLen ? displayName.substring(0, maxLen) + '...' : displayName}
      </div>
      {isFilled && !isRoot && (
        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
      )}
    </div>
  );
}

// SVG connection lines between parent-child pairs
function ConnectionLinesSVG({ 
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
    const calculateLines = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

      // For each ancestor with parents, draw lines
      ancestors.filter(a => a.parentIds.length > 0).forEach(child => {
        const childEl = nodeRefs.current.get(child.id);
        if (!childEl) return;

        const childRect = childEl.getBoundingClientRect();
        const childX = childRect.left + childRect.width / 2 - containerRect.left;
        const childY = childRect.bottom - containerRect.top;

        child.parentIds.forEach(parentId => {
          const parentEl = nodeRefs.current.get(parentId);
          if (!parentEl) return;

          const parentRect = parentEl.getBoundingClientRect();
          const parentX = parentRect.left + parentRect.width / 2 - containerRect.left;
          const parentY = parentRect.top - containerRect.top;

          newLines.push({
            x1: childX,
            y1: childY,
            x2: parentX,
            y2: parentY
          });
        });
      });

      setLines(newLines);
    };

    // Calculate after render
    const timer = setTimeout(calculateLines, 100);
    window.addEventListener('resize', calculateLines);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateLines);
    };
  }, [ancestors, containerRef, nodeRefs]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#5D4037" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {lines.map((line, idx) => (
        <line
          key={idx}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// Tree visualization component - Inverted pine tree shape
function AncestralTreeVisualization({ 
  ancestors, 
  activeId 
}: { 
  ancestors: Ancestor[]; 
  activeId: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [, forceUpdate] = useState({});

  const getByLevel = (level: number) => ancestors.filter(a => a.level === level);

  // Force re-render after nodes are mounted to calculate lines
  useEffect(() => {
    const timer = setTimeout(() => forceUpdate({}), 50);
    return () => clearTimeout(timer);
  }, []);

  const setNodeRef = (id: number) => (el: HTMLDivElement | null) => {
    nodeRefs.current.set(id, el);
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-visible"
      style={{
        background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 40%, #0D4A0D 100%)',
        padding: '35px 15px 40px 15px',
        borderRadius: '50% 50% 48% 48% / 35% 35% 55% 55%',
        border: '4px solid #5D4037',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)',
        outline: '3px solid #8D6E63',
        outlineOffset: '2px',
      }}
    >
      {/* Connection Lines */}
      <ConnectionLinesSVG 
        containerRef={containerRef}
        nodeRefs={nodeRefs}
        ancestors={ancestors}
      />

      <div className="relative flex flex-col items-center gap-3" style={{ zIndex: 2 }}>
        {/* Star decoration at top */}
        <div className="text-amber-300 text-3xl -mt-2">⭐</div>

        {/* Level 0 - Você (1) - Top of tree */}
        <div className="flex flex-col items-center">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-green-600/80 mb-1">
            Você
          </span>
          <div className="flex justify-center">
            {getByLevel(0).map(ancestor => (
              <div key={ancestor.id} ref={setNodeRef(ancestor.id)}>
                <TreeNode 
                  ancestor={ancestor} 
                  isHighlighted={activeId === ancestor.id}
                  isRoot={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Level 1 - Pais (2) */}
        <div className="flex flex-col items-center mt-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-orange-500/80 mb-1">
            Pais
          </span>
          <div className="flex justify-center gap-6">
            {getByLevel(1).map(ancestor => (
              <div key={ancestor.id} ref={setNodeRef(ancestor.id)}>
                <TreeNode 
                  ancestor={ancestor} 
                  isHighlighted={activeId === ancestor.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Level 2 - Avós (4) */}
        <div className="flex flex-col items-center mt-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-blue-500/80 mb-1">
            Avós
          </span>
          <div className="flex justify-center gap-2">
            {getByLevel(2).map(ancestor => (
              <div key={ancestor.id} ref={setNodeRef(ancestor.id)}>
                <TreeNode 
                  ancestor={ancestor} 
                  isHighlighted={activeId === ancestor.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Level 3 - Bisavós (8) - Base of tree (widest) */}
        <div className="flex flex-col items-center mt-1">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-purple-500/80 mb-1">
            Bisavós
          </span>
          <div className="flex justify-center gap-0.5 flex-nowrap">
            {getByLevel(3).map(ancestor => (
              <div key={ancestor.id} ref={setNodeRef(ancestor.id)}>
                <TreeNode 
                  ancestor={ancestor} 
                  isHighlighted={activeId === ancestor.id}
                  isSmall={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree trunk component
function TreeTrunk() {
  return (
    <div className="flex flex-col items-center -mt-1">
      {/* Trunk */}
      <div 
        className="w-10 h-10 rounded-b-lg"
        style={{
          background: 'linear-gradient(180deg, #5D4037 0%, #3E2723 100%)',
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.3)'
        }}
      />
      {/* Ground/Base */}
      <div 
        className="w-28 h-3 -mt-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #6D4C41 0%, #4E342E 100%)'
        }}
      />
    </div>
  );
}

// Input section for a level
function LevelInputSection({ 
  level,
  title,
  count,
  color,
  ancestors,
  onUpdate,
  onFocus,
  isOpen,
  onToggle
}: { 
  level: number;
  title: string;
  count: number;
  color: string;
  ancestors: Ancestor[];
  onUpdate: (id: number, name: string) => void;
  onFocus: (id: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const filledCount = ancestors.filter(a => a.name.trim()).length;
  
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <div 
          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all"
          style={{ borderColor: color, backgroundColor: `${color}10` }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {count}
            </div>
            <span className="font-semibold text-[#5D4037]">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filledCount}/{count} preenchidos
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-2">
          {ancestors.map((ancestor) => {
            const isFilled = ancestor.name.trim() !== '';
            return (
              <div 
                key={ancestor.id} 
                className={`p-3 rounded-lg border transition-all ${
                  isFilled 
                    ? 'bg-[#FFF3E0] border-[#FF8A65]' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-[#795548]" />
                  <span className="text-sm font-medium text-[#5D4037]">{ancestor.relation}</span>
                  {isFilled && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
                
                <div>
                  <Label className="text-xs text-[#795548]">Nome</Label>
                  <Input
                    value={ancestor.name}
                    onChange={(e) => onUpdate(ancestor.id, e.target.value)}
                    onFocus={() => onFocus(ancestor.id)}
                    onBlur={() => onFocus(null)}
                    placeholder={ancestor.gender === 'F' ? 'Nome da ancestral...' : 'Nome do ancestral...'}
                    className="h-9 text-sm border-gray-300 focus:border-[#7CB342] bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FamilyTreeActivity({ description, onSubmit, isSubmitting, fontSizeClass }: FamilyTreeActivityProps) {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Você';
  
  const [ancestors, setAncestors] = useState<Ancestor[]>(() => createTreeStructure(userName));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [openLevels, setOpenLevels] = useState<number[]>([1]); // Start with Parents open

  const updateAncestor = (id: number, name: string) => {
    setAncestors(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };

  const toggleLevel = (level: number) => {
    setOpenLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  // Count filled ancestors (excluding level 0 which is auto-filled)
  const filledCount = ancestors.filter(a => a.level > 0 && a.name.trim()).length;
  const totalEditable = 14; // 2 + 4 + 8
  const isComplete = filledCount >= 3;

  const formatContent = () => {
    const grouped = LEVELS_VISUAL.map(l => ({
      ...l,
      members: ancestors.filter(a => a.level === l.level && a.name.trim())
    })).filter(g => g.members.length > 0);

    return grouped
      .map(group => {
        const membersText = group.members
          .map(m => `- **${m.relation}:** ${m.name}`)
          .join('\n');
        return `### ${group.title}\n${membersText}`;
      })
      .join('\n\n');
  };

  const handleSubmit = async () => {
    await onSubmit(formatContent());
  };

  const getAncestorsByLevel = (level: number) => ancestors.filter(a => a.level === level);

  return (
    <div className="space-y-6">
      {/* Orientation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreeDeciduous className="h-5 w-5 text-[#7CB342]" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Árvore Genealógica</span>
          </div>
          <FontSizeControl />
        </div>
        
        <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
          Construa sua árvore genealógica de ancestrais. Partindo de você, preencha os nomes dos seus pais, avós e bisavós.
        </p>
        
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-[#2E7D32] p-4 rounded-r-lg">
          <p className={`text-[#5D4037] font-medium ${fontSizeClass}`}>
            🌲 Sua árvore genealógica em formato de pinheiro: você no topo, ancestrais expandindo para a base.
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            💡 Preencha pelo menos 3 ancestrais para enviar
          </span>
          <span className={`font-semibold ${filledCount >= 3 ? 'text-green-600' : 'text-[#795548]'}`}>
            {filledCount}/{totalEditable} preenchidos
          </span>
        </div>
      </div>

      {/* Input Forms - Above */}
      <div className="space-y-3">
        {LEVELS_INPUT.map(({ level, title, count, color }) => (
          <LevelInputSection
            key={level}
            level={level}
            title={title}
            count={count}
            color={color}
            ancestors={getAncestorsByLevel(level)}
            onUpdate={updateAncestor}
            onFocus={setActiveId}
            isOpen={openLevels.includes(level)}
            onToggle={() => toggleLevel(level)}
          />
        ))}
      </div>

      {/* Tree Visualization - Below */}
      <div 
        className="rounded-2xl p-6 border border-green-200 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)'
        }}
      >
        <h3 className="text-center text-sm font-semibold text-[#2E7D32] mb-4">
          🌲 Sua Árvore de Ancestrais
        </h3>
        <AncestralTreeVisualization ancestors={ancestors} activeId={activeId} />
        <TreeTrunk />
      </div>

      {/* Progress and Submit */}
      <div className="space-y-4 pt-4 border-t border-primary/10">
        <div className="flex items-center justify-center gap-2">
          {isComplete ? (
            <span className="text-green-600 font-medium flex items-center gap-1 text-sm">
              <CheckCircle className="h-4 w-4" /> 
              Pronto para enviar sua Árvore Genealógica!
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Preencha pelo menos 3 ancestrais ({filledCount}/3)
            </span>
          )}
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          className="w-full py-6 text-lg font-semibold"
          style={{
            background: isComplete 
              ? 'linear-gradient(135deg, #2E7D32, #1B5E20)' 
              : undefined
          }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Árvore Genealógica'}
        </Button>
      </div>
    </div>
  );
}
