import { useState } from 'react';
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

const LEVELS = [
  { level: 3, title: 'Bisavós', count: 8, color: '#9C27B0' },
  { level: 2, title: 'Avós', count: 4, color: '#2196F3' },
  { level: 1, title: 'Pais', count: 2, color: '#FF9800' },
  { level: 0, title: 'Você', count: 1, color: '#4CAF50' },
];

// Tree node component
function TreeNode({ 
  ancestor, 
  isHighlighted,
  isRoot = false
}: { 
  ancestor: Ancestor; 
  isHighlighted: boolean;
  isRoot?: boolean;
}) {
  const isFilled = ancestor.name.trim() !== '';
  const displayName = isFilled ? ancestor.name : (ancestor.gender === 'F' ? 'Desconhecida' : ancestor.gender === 'M' ? 'Desconhecido' : '?');
  
  return (
    <div 
      className={`
        relative px-2 py-1.5 text-center rounded-lg border-2 
        transition-all duration-300 transform min-w-[60px] max-w-[80px]
        ${isRoot 
          ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-500 shadow-lg' 
          : isFilled 
            ? 'bg-[#FFF3E0] border-[#FF8A65] shadow-md' 
            : 'bg-white/70 border-dashed border-gray-300'
        }
        ${isHighlighted ? 'ring-2 ring-[#FF8A65] ring-offset-1 scale-110' : ''}
      `}
    >
      <div className="text-[9px] text-[#795548] font-medium truncate mb-0.5 leading-tight">
        {ancestor.relation.split(' ')[0]}
      </div>
      <div className={`text-[10px] font-semibold truncate ${isFilled || isRoot ? 'text-[#5D4037]' : 'text-gray-400 italic'}`}>
        {displayName.length > 10 ? displayName.substring(0, 10) + '...' : displayName}
      </div>
      {isFilled && !isRoot && (
        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
      )}
    </div>
  );
}

// SVG connection lines between levels
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#795548" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#795548" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Tree visualization component
function AncestralTreeVisualization({ 
  ancestors, 
  activeId 
}: { 
  ancestors: Ancestor[]; 
  activeId: number | null;
}) {
  const getByLevel = (level: number) => ancestors.filter(a => a.level === level);
  
  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Level 3 - Bisavós (8) */}
      <div className="text-center mb-1">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-purple-500">
          Bisavós (8)
        </span>
      </div>
      <div className="flex justify-center gap-1 flex-wrap max-w-full">
        {getByLevel(3).map(ancestor => (
          <TreeNode 
            key={ancestor.id} 
            ancestor={ancestor} 
            isHighlighted={activeId === ancestor.id}
          />
        ))}
      </div>
      
      {/* Connection indicator */}
      <div className="w-px h-4 bg-[#795548]/40" />
      
      {/* Level 2 - Avós (4) */}
      <div className="text-center mb-1">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-blue-500">
          Avós (4)
        </span>
      </div>
      <div className="flex justify-center gap-2">
        {getByLevel(2).map(ancestor => (
          <TreeNode 
            key={ancestor.id} 
            ancestor={ancestor} 
            isHighlighted={activeId === ancestor.id}
          />
        ))}
      </div>
      
      {/* Connection indicator */}
      <div className="w-px h-4 bg-[#795548]/40" />
      
      {/* Level 1 - Pais (2) */}
      <div className="text-center mb-1">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-orange-500">
          Pais (2)
        </span>
      </div>
      <div className="flex justify-center gap-4">
        {getByLevel(1).map(ancestor => (
          <TreeNode 
            key={ancestor.id} 
            ancestor={ancestor} 
            isHighlighted={activeId === ancestor.id}
          />
        ))}
      </div>
      
      {/* Connection indicator */}
      <div className="w-px h-4 bg-[#795548]/40" />
      
      {/* Level 0 - Você (1) */}
      <div className="text-center mb-1">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-green-500">
          Você (1)
        </span>
      </div>
      <div className="flex justify-center">
        {getByLevel(0).map(ancestor => (
          <TreeNode 
            key={ancestor.id} 
            ancestor={ancestor} 
            isHighlighted={activeId === ancestor.id}
            isRoot={true}
          />
        ))}
      </div>
      
      {/* Tree trunk visual */}
      <div 
        className="w-8 h-12 rounded-b-lg mt-1"
        style={{
          background: 'linear-gradient(180deg, #795548 0%, #5D4037 100%)',
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.2)'
        }}
      />
      
      {/* Ground/Roots */}
      <div 
        className="w-20 h-3 -mt-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #8D6E63 0%, #6D4C41 100%)'
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
  
  // Don't show input section for level 0 (Você - auto-filled)
  if (level === 0) return null;
  
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
    const grouped = LEVELS.map(l => ({
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
        
        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border-l-4 border-[#7CB342] p-4 rounded-r-lg">
          <p className={`text-[#5D4037] font-medium ${fontSizeClass}`}>
            📌 A estrutura segue o padrão genealógico: 1 → 2 → 4 → 8 pessoas por geração.
            Campos não preenchidos aparecerão como "Desconhecido(a)".
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

      {/* Main Content - Split Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Side - Tree Visualization */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-4">
            <div 
              className="rounded-2xl p-4 border border-sky-200"
              style={{
                background: 'linear-gradient(180deg, #E3F2FD 0%, #E8F5E9 50%, #F1F8E9 100%)'
              }}
            >
              <h3 className="text-center text-sm font-semibold text-[#5D4037] mb-3">
                Sua Árvore de Ancestrais
              </h3>
              <AncestralTreeVisualization ancestors={ancestors} activeId={activeId} />
            </div>
          </div>
        </div>
        
        {/* Right Side - Input Forms */}
        <div className="order-1 lg:order-2">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-3">
              {LEVELS.filter(l => l.level > 0).map(({ level, title, count, color }) => (
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
          </ScrollArea>
        </div>
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
              ? 'linear-gradient(135deg, #7CB342, #558B2F)' 
              : undefined
          }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Árvore Genealógica'}
        </Button>
      </div>
    </div>
  );
}
