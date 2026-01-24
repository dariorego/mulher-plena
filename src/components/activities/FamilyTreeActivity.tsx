import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { CheckCircle, TreeDeciduous, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FamilyMember {
  relation: string;
  name: string;
  learning: string;
}

interface FamilyTreeActivityProps {
  description?: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

// Tree positions organized by levels (matching the reference image structure)
const treePositions = [
  // Level 1 - Avós Maternos (top, 2 positions)
  { id: 0, label: 'Avó Materna', level: 1 },
  { id: 1, label: 'Avô Materno', level: 1 },
  // Level 2 - Avós Paternos (2 positions)
  { id: 2, label: 'Avó Paterna', level: 2 },
  { id: 3, label: 'Avô Paterno', level: 2 },
  // Level 3 - Pais e Tios (4 positions)
  { id: 4, label: 'Mãe', level: 3 },
  { id: 5, label: 'Pai', level: 3 },
  { id: 6, label: 'Tia', level: 3 },
  { id: 7, label: 'Tio', level: 3 },
  // Level 4 - Você, Irmãos, Primos, Cônjuge (5 positions)
  { id: 8, label: 'Irmã(o)', level: 4 },
  { id: 9, label: 'EU', level: 4 },
  { id: 10, label: 'Prima(o)', level: 4 },
  { id: 11, label: 'Prima(o)', level: 4 },
  { id: 12, label: 'Cônjuge', level: 4 },
  // Level 5 - Filhos (bottom, 2 positions)
  { id: 13, label: 'Filha(o)', level: 5 },
  { id: 14, label: 'Filha(o)', level: 5 },
];

const levelLabels = [
  { level: 1, title: 'Avós Maternos' },
  { level: 2, title: 'Avós Paternos' },
  { level: 3, title: 'Pais e Tios' },
  { level: 4, title: 'Você e Sua Geração' },
  { level: 5, title: 'Filhos' },
];

// Tree visualization slot component
function TreeSlot({ member, isFilled, isHighlighted }: { 
  member: FamilyMember; 
  isFilled: boolean;
  isHighlighted: boolean;
}) {
  return (
    <div 
      className={`
        relative px-2 py-1.5 min-w-[70px] max-w-[90px] text-center rounded-lg border-2 
        transition-all duration-300 transform
        ${isFilled 
          ? 'bg-[#FFF3E0] border-[#FF8A65] shadow-md scale-105' 
          : 'bg-white/60 border-dashed border-[#A5D6A7]'
        }
        ${isHighlighted ? 'ring-2 ring-[#FF8A65] ring-offset-1' : ''}
      `}
    >
      <div className="text-[10px] text-[#795548] font-medium truncate mb-0.5">
        {member.relation}
      </div>
      <div className={`text-xs font-semibold truncate ${isFilled ? 'text-[#5D4037]' : 'text-gray-400'}`}>
        {member.name || '?'}
      </div>
      {isFilled && (
        <CheckCircle className="absolute -top-1.5 -right-1.5 h-4 w-4 text-green-500 bg-white rounded-full" />
      )}
    </div>
  );
}

// Tree visualization component
function TreeVisualization({ members, activeIndex }: { members: FamilyMember[]; activeIndex: number | null }) {
  const getPositionsByLevel = (level: number) => {
    return treePositions.filter(p => p.level === level).map(p => ({
      ...p,
      member: members[p.id],
      isFilled: !!(members[p.id].name.trim() && members[p.id].learning.trim())
    }));
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Tree Crown */}
      <div 
        className="relative w-full max-w-md rounded-[50%] py-6 px-4"
        style={{
          background: 'radial-gradient(ellipse at center, #7CB342 0%, #558B2F 70%, #33691E 100%)',
          boxShadow: 'inset 0 -10px 30px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <div className="space-y-3">
          {/* Level 1 - Avós Maternos */}
          <div className="flex justify-center gap-4">
            {getPositionsByLevel(1).map(pos => (
              <TreeSlot 
                key={pos.id} 
                member={pos.member} 
                isFilled={pos.isFilled}
                isHighlighted={activeIndex === pos.id}
              />
            ))}
          </div>
          
          {/* Level 2 - Avós Paternos */}
          <div className="flex justify-center gap-4">
            {getPositionsByLevel(2).map(pos => (
              <TreeSlot 
                key={pos.id} 
                member={pos.member} 
                isFilled={pos.isFilled}
                isHighlighted={activeIndex === pos.id}
              />
            ))}
          </div>
          
          {/* Level 3 - Pais e Tios */}
          <div className="flex justify-center gap-2">
            {getPositionsByLevel(3).map(pos => (
              <TreeSlot 
                key={pos.id} 
                member={pos.member} 
                isFilled={pos.isFilled}
                isHighlighted={activeIndex === pos.id}
              />
            ))}
          </div>
          
          {/* Level 4 - Você e Geração */}
          <div className="flex justify-center gap-1.5">
            {getPositionsByLevel(4).map(pos => (
              <TreeSlot 
                key={pos.id} 
                member={pos.member} 
                isFilled={pos.isFilled}
                isHighlighted={activeIndex === pos.id}
              />
            ))}
          </div>
          
          {/* Level 5 - Filhos */}
          <div className="flex justify-center gap-4 pt-1">
            {getPositionsByLevel(5).map(pos => (
              <TreeSlot 
                key={pos.id} 
                member={pos.member} 
                isFilled={pos.isFilled}
                isHighlighted={activeIndex === pos.id}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Tree Trunk */}
      <div 
        className="w-16 h-20 -mt-2 rounded-b-lg"
        style={{
          background: 'linear-gradient(180deg, #795548 0%, #5D4037 100%)',
          boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.2)'
        }}
      />
      
      {/* Ground/Roots */}
      <div 
        className="w-32 h-4 -mt-1 rounded-full"
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
  members, 
  onUpdate,
  onFocus 
}: { 
  level: number; 
  title: string; 
  members: { id: number; member: FamilyMember }[];
  onUpdate: (id: number, field: keyof FamilyMember, value: string) => void;
  onFocus: (id: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div 
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7CB342, #558B2F)' }}
        >
          Nível {level}
        </div>
        <span className="text-sm font-medium text-[#5D4037]">{title}</span>
      </div>
      
      <div className="grid gap-3">
        {members.map(({ id, member }) => {
          const isFilled = !!(member.name.trim() && member.learning.trim());
          return (
            <div 
              key={id} 
              className={`p-3 rounded-lg border transition-all ${
                isFilled 
                  ? 'bg-[#FFF3E0] border-[#FF8A65]' 
                  : 'bg-white border-[#A5D6A7]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#795548]" />
                <span className="text-sm font-medium text-[#5D4037]">{member.relation}</span>
                {isFilled && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              </div>
              
              <div className="grid gap-2">
                <div>
                  <Label className="text-xs text-[#795548]">Nome</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => onUpdate(id, 'name', e.target.value)}
                    onFocus={() => onFocus(id)}
                    onBlur={() => onFocus(null)}
                    placeholder="Digite o nome..."
                    className="h-8 text-sm border-[#A5D6A7] focus:border-[#7CB342] bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#795548]">O que aprendeu?</Label>
                  <Textarea
                    value={member.learning}
                    onChange={(e) => onUpdate(id, 'learning', e.target.value)}
                    onFocus={() => onFocus(id)}
                    onBlur={() => onFocus(null)}
                    placeholder="Qual aprendizado recebeu dessa pessoa?"
                    rows={2}
                    className="resize-none text-sm border-[#A5D6A7] focus:border-[#7CB342] bg-white"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FamilyTreeActivity({ description, onSubmit, isSubmitting, fontSizeClass }: FamilyTreeActivityProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    treePositions.map(pos => ({ relation: pos.label, name: '', learning: '' }))
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newMembers = [...familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFamilyMembers(newMembers);
  };

  const filledCount = familyMembers.filter(m => m.name.trim() && m.learning.trim()).length;
  const isComplete = filledCount >= 3;

  const formatContent = () => {
    return familyMembers
      .filter(m => m.name.trim() || m.learning.trim())
      .map((member) => 
        `**${member.relation}:** ${member.name}\n**Aprendizado:** ${member.learning}`
      )
      .join('\n\n---\n\n');
  };

  const handleSubmit = async () => {
    await onSubmit(formatContent());
  };

  const getMembersByLevel = (level: number) => {
    return treePositions
      .filter(p => p.level === level)
      .map(p => ({ id: p.id, member: familyMembers[p.id] }));
  };

  return (
    <div className="space-y-6">
      {/* Orientation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreeDeciduous className="h-5 w-5 text-[#7CB342]" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Árvore da Gratidão</span>
          </div>
          <FontSizeControl />
        </div>
        
        <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
          Construa sua árvore genealógica e registre os aprendizados que cada pessoa da sua família trouxe para sua vida.
        </p>
        
        <div className="bg-[#E8F5E9] border-l-4 border-[#7CB342] p-4 rounded-r-lg">
          <p className={`text-[#5D4037] font-medium ${fontSizeClass}`}>
            Preencha o nome e o aprendizado de cada familiar. Conforme você digita, os nomes aparecem na árvore!
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            💡 Mínimo de 3 pessoas para enviar
          </span>
          <span className={`font-semibold ${filledCount >= 3 ? 'text-green-600' : 'text-[#795548]'}`}>
            {filledCount}/15 preenchidos
          </span>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Side - Tree Visualization */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-4">
            <div className="bg-gradient-to-b from-sky-100 to-sky-50 rounded-2xl p-6 border border-sky-200">
              <h3 className="text-center text-sm font-semibold text-[#5D4037] mb-4">
                Sua Árvore Genealógica
              </h3>
              <TreeVisualization members={familyMembers} activeIndex={activeIndex} />
            </div>
          </div>
        </div>
        
        {/* Right Side - Input Forms */}
        <div className="order-1 lg:order-2">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {levelLabels.map(({ level, title }) => (
                <LevelInputSection
                  key={level}
                  level={level}
                  title={title}
                  members={getMembersByLevel(level)}
                  onUpdate={updateMember}
                  onFocus={setActiveIndex}
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
              Pronto para enviar sua Árvore da Gratidão!
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Preencha pelo menos 3 membros da família ({filledCount}/3)
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
          {isSubmitting ? 'Enviando...' : 'Enviar Árvore da Gratidão'}
        </Button>
      </div>
    </div>
  );
}
