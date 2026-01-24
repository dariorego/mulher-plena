import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Users, TreeDeciduous, CheckCircle } from 'lucide-react';

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

// Default relations for the tree structure
const defaultRelations = [
  // Row 1 - Bisavós (4)
  'Bisavó/Bisavô 1', 'Bisavó/Bisavô 2', 'Bisavó/Bisavô 3', 'Bisavó/Bisavô 4',
  // Row 2 - Avós (4)
  'Avó/Avô 1', 'Avó/Avô 2', 'Avó/Avô 3', 'Avó/Avô 4',
  // Row 3 - Pais/Tios (4)
  'Pai/Mãe', 'Pai/Mãe', 'Tio(a) 1', 'Tio(a) 2',
  // Row 4 - Irmãos/Cônjuge (2)
  'Irmão(ã)/Cônjuge', 'Irmão(ã)/Primo(a)',
  // Row 5 - Você/Filhos (1)
  'Você/Filho(a)'
];

export function FamilyTreeActivity({ description, onSubmit, isSubmitting, fontSizeClass }: FamilyTreeActivityProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    defaultRelations.map(relation => ({ relation, name: '', learning: '' }))
  );

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newMembers = [...familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFamilyMembers(newMembers);
  };

  const filledCount = familyMembers.filter(m => m.name.trim() && m.learning.trim()).length;
  const isComplete = filledCount >= 3; // Minimum 3 entries to submit

  const formatContent = () => {
    return familyMembers
      .filter(m => m.name.trim() || m.learning.trim())
      .map((member, i) => 
        `**${member.relation}:** ${member.name}\n**Aprendizado:** ${member.learning}`
      )
      .join('\n\n---\n\n');
  };

  const handleSubmit = async () => {
    await onSubmit(formatContent());
  };

  // Render a single member card
  const MemberCard = ({ index, className = '' }: { index: number; className?: string }) => {
    const member = familyMembers[index];
    const isFilled = member.name.trim() && member.learning.trim();
    
    return (
      <Card className={`bg-cream/50 border-primary/10 shadow-sm transition-all hover:shadow-md ${isFilled ? 'ring-2 ring-accent/30' : ''} ${className}`}>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-cinzel text-accent flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span className="truncate">{member.relation}</span>
            {isFilled && <CheckCircle className="h-3 w-3 text-green-500 ml-auto flex-shrink-0" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <div className="space-y-1">
            <Label className="text-xs text-primary/70">Nome</Label>
            <Input
              value={member.name}
              onChange={(e) => updateMember(index, 'name', e.target.value)}
              placeholder="Nome da pessoa"
              className="h-8 text-sm border-primary/20 focus:border-primary bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-primary/70">Aprendizado</Label>
            <Textarea
              value={member.learning}
              onChange={(e) => updateMember(index, 'learning', e.target.value)}
              placeholder="O que aprendeu com ela?"
              rows={2}
              className="resize-none text-sm border-primary/20 focus:border-primary bg-background"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Orientation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
            <div className="flex-1 h-px bg-primary/20"></div>
          </div>
          <FontSizeControl />
        </div>
        
        <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
          Elabore uma árvore genealógica simples e registre um aprendizado associado a cada pessoa de sua família.
        </p>
        
        <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
          <p className={`text-primary font-medium ${fontSizeClass}`}>
            Para cada familiar, preencha o nome e compartilhe um aprendizado significativo que você recebeu dessa pessoa.
          </p>
        </div>
        
        <p className={`text-muted-foreground italic ${fontSizeClass}`}>
          💡 Dica: Você pode personalizar as relações familiares clicando no campo. Preencha pelo menos 3 pessoas para enviar.
        </p>
      </div>

      {/* Tree Header */}
      <div className="flex items-center gap-2">
        <TreeDeciduous className="h-5 w-5 text-accent" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Árvore da Gratidão</span>
        <div className="flex-1 h-px bg-primary/20"></div>
        <span className="text-xs text-muted-foreground">
          {filledCount}/15 preenchidos
        </span>
      </div>

      {/* Tree Structure - Visual hierarchy */}
      <div className="space-y-4 overflow-x-auto pb-4">
        {/* Row 1 - Bisavós (4 cards) */}
        <div className="flex justify-center gap-2 min-w-max">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-44">
              <MemberCard index={i} />
            </div>
          ))}
        </div>
        
        {/* Connection lines visual indicator */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl h-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>
        </div>

        {/* Row 2 - Avós (4 cards) */}
        <div className="flex justify-center gap-2 min-w-max">
          {[4, 5, 6, 7].map(i => (
            <div key={i} className="w-44">
              <MemberCard index={i} />
            </div>
          ))}
        </div>

        {/* Connection lines */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl h-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
        </div>

        {/* Row 3 - Pais/Tios (4 cards) */}
        <div className="flex justify-center gap-2 min-w-max">
          {[8, 9, 10, 11].map(i => (
            <div key={i} className="w-44">
              <MemberCard index={i} />
            </div>
          ))}
        </div>

        {/* Connection lines */}
        <div className="flex justify-center">
          <div className="w-full max-w-md h-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          </div>
        </div>

        {/* Row 4 - Irmãos/Cônjuge (2 cards) */}
        <div className="flex justify-center gap-2 min-w-max">
          {[12, 13].map(i => (
            <div key={i} className="w-44">
              <MemberCard index={i} />
            </div>
          ))}
        </div>

        {/* Connection lines */}
        <div className="flex justify-center">
          <div className="w-32 h-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          </div>
        </div>

        {/* Row 5 - Você/Filhos (1 card) */}
        <div className="flex justify-center">
          <div className="w-48">
            <MemberCard index={14} className="border-accent/30 bg-accent/5" />
          </div>
        </div>
      </div>

      {/* Progress and Submit */}
      <div className="space-y-4 pt-4 border-t border-primary/10">
        <div className="flex items-center justify-center gap-2">
          {isComplete ? (
            <span className="text-green-600 font-medium flex items-center gap-1 text-sm">
              <CheckCircle className="h-4 w-4" /> 
              Mínimo de 3 membros preenchidos - Pronto para enviar!
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Preencha pelo menos 3 membros da família para enviar ({filledCount}/3)
            </span>
          )}
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Árvore da Gratidão'}
        </Button>
      </div>
    </div>
  );
}
