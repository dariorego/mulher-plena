import { createTreeStructure, AncestralTreeVisualization, TreeTrunk, type Ancestor } from './FamilyTreeActivity';

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

function parseFamilyTreeContent(content: string): Ancestor[] {
  const base = createTreeStructure('Você');
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^- \*\*(.+?):\*\*\s*(.+)$/);
    if (!match) continue;

    const [, relation, name] = match;
    const trimmedRelation = relation.trim();
    const trimmedName = name.trim();

    const id = RELATION_TO_ID[trimmedRelation];
    if (id !== undefined) {
      const ancestor = base.find(a => a.id === id);
      if (ancestor) {
        ancestor.name = trimmedName;
      }
    }
  }

  return base;
}

export function SubmittedFamilyTreeView({ content }: SubmittedFamilyTreeViewProps) {
  const ancestors = parseFamilyTreeContent(content);

  return (
    <div className="space-y-2">
      <div 
        className="rounded-2xl p-4 sm:p-6 border border-green-200 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)'
        }}
      >
        <h3 className="text-center text-sm font-semibold text-[#2E7D32] mb-4">
          🌲 Sua Árvore de Ancestrais
        </h3>
        <AncestralTreeVisualization ancestors={ancestors} activeId={null} />
        <TreeTrunk />
      </div>
    </div>
  );
}
