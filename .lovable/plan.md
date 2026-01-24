
# Plano: Árvore Genealógica de Ancestrais

## Resumo
Substituir o componente "Árvore da Gratidão" atual por uma nova estrutura de árvore genealógica que parte do usuário logado e sobe até os bisavós, seguindo o padrão tradicional de 1, 2, 4, 8 pessoas por nível.

## Nova Estrutura Visual

```text
                    BISAVÓS (8)
    ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐
    │Bisavô │Bisavó │Bisavô │Bisavó │Bisavô │Bisavó │Bisavô │Bisavó │
    │Mat.1  │Mat.1  │Mat.2  │Mat.2  │Pat.1  │Pat.1  │Pat.2  │Pat.2  │
    └───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┘
        │       │       │       │       │       │       │       │
                    AVÓS (4)
        ┌───────┬───────┬───────┬───────┐
        │  Avô  │  Avó  │  Avô  │  Avó  │
        │Materno│Materna│Paterno│Paterna│
        └───┬───┴───┬───┴───┬───┴───┬───┘
            │       │       │       │
                    PAIS (2)
            ┌───────┬───────┐
            │  Mãe  │  Pai  │
            └───┬───┴───┬───┘
                │       │
                    VOCÊ (1)
                ┌───────┐
                │Usuário│
                │ Atual │
                └───────┘
```

### Níveis (de baixo para cima):
- **Nível 0 - Você**: 1 posição (usuário logado, exibido automaticamente)
- **Nível 1 - Pais**: 2 posições (Mãe e Pai)
- **Nível 2 - Avós**: 4 posições (Avô/Avó Materno(a), Avô/Avó Paterno(a))
- **Nível 3 - Bisavós**: 8 posições (derivados de cada avô/avó)

## Design Visual

### Layout Principal
- Árvore invertida: usuário na base, ancestrais subindo
- Cada nível com título claro: "Você (1)", "Pais (2)", "Avós (4)", "Bisavós (8)"
- Linhas de conexão representando as relações pai/mãe → filho(a)
- Split-view: formulário à direita, visualização à esquerda

### Cores (mantendo tema natural):
- Fundo da árvore: gradiente azul-céu para verde suave
- Cards preenchidos: `#FFF3E0` com borda `#FF8A65`
- Cards vazios: fundo translúcido com "?" ou "Desconhecido(a)"
- Linhas de conexão: `#795548` (marrom)
- Níveis: badges coloridos indicando a geração

### Responsividade:
- **Desktop**: Árvore à esquerda (sticky), inputs à direita (scroll)
- **Mobile**: Stack vertical com árvore condensada no topo

## Estrutura de Dados

```typescript
interface Ancestor {
  id: number;
  level: number;           // 0 = você, 1 = pais, 2 = avós, 3 = bisavós
  relation: string;        // "Você", "Mãe", "Pai", "Avó Materna", etc.
  name: string;
  gender: 'M' | 'F' | null;
  parentIds: number[];     // IDs dos pais deste ancestral
}

const treeStructure = [
  // Nível 0 - Você (raiz)
  { id: 0, level: 0, relation: 'Você', gender: null, parentIds: [1, 2] },
  
  // Nível 1 - Pais
  { id: 1, level: 1, relation: 'Mãe', gender: 'F', parentIds: [3, 4] },
  { id: 2, level: 1, relation: 'Pai', gender: 'M', parentIds: [5, 6] },
  
  // Nível 2 - Avós
  { id: 3, level: 2, relation: 'Avó Materna', gender: 'F', parentIds: [7, 8] },
  { id: 4, level: 2, relation: 'Avô Materno', gender: 'M', parentIds: [9, 10] },
  { id: 5, level: 2, relation: 'Avó Paterna', gender: 'F', parentIds: [11, 12] },
  { id: 6, level: 2, relation: 'Avô Paterno', gender: 'M', parentIds: [13, 14] },
  
  // Nível 3 - Bisavós (8 posições)
  { id: 7, level: 3, relation: 'Bisavó Materna (mãe da avó)', gender: 'F' },
  { id: 8, level: 3, relation: 'Bisavô Materno (pai da avó)', gender: 'M' },
  // ... 6 mais posições
];
```

## Fluxo de Interação

1. **Usuário logado aparece automaticamente** no nível 0 (base da árvore)
2. Participante preenche os campos de nome para cada ancestral
3. Campos vazios exibem "Desconhecido(a)" como placeholder visual
4. Conforme digita, nomes aparecem na visualização da árvore em tempo real
5. Linhas de conexão ligam cada pessoa aos seus pais
6. Mínimo de 3 ancestrais preenchidos para enviar (ou sem mínimo)
7. Ao submeter, dados são formatados e salvos na submissão da atividade

## Componentes Internos

### 1. TreeNode
- Exibe um card individual na árvore
- Mostra nome ou placeholder "?"
- Indicador visual de preenchido/vazio
- Destaque quando campo correspondente está em foco

### 2. ConnectionLines (SVG)
- Desenha linhas conectando pais a filhos
- Linhas partem do centro inferior do pai
- Chegam ao centro superior do filho
- Cores diferenciadas por ramo (materno/paterno)

### 3. LevelSection
- Agrupa inputs por nível (Pais, Avós, Bisavós)
- Badge com quantidade: "Pais (2)", "Avós (4)", "Bisavós (8)"
- Accordion ou seção expansível para cada nível

### 4. AncestralTreeVisualization
- Renderiza a árvore completa com SVG/CSS
- Layout responsivo que escala
- Animações suaves ao preencher

## Mudanças Técnicas

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/activities/FamilyTreeActivity.tsx` | Reescrever completamente |

### Estrutura do Novo Componente

```typescript
// Constantes de estrutura
const LEVELS = [
  { level: 3, title: 'Bisavós', count: 8 },
  { level: 2, title: 'Avós', count: 4 },
  { level: 1, title: 'Pais', count: 2 },
  { level: 0, title: 'Você', count: 1 },
];

// 15 posições totais: 1 + 2 + 4 + 8
const treePositions = [...]; // array com 15 itens

// Estados
const [ancestors, setAncestors] = useState<Ancestor[]>([...]);
const [activeId, setActiveId] = useState<number | null>(null);

// Formatar para submissão
const formatContent = () => {
  return ancestors
    .filter(a => a.name.trim())
    .map(a => `**${a.relation}:** ${a.name}`)
    .join('\n\n');
};
```

## Resultado Final

Uma árvore genealógica visual e interativa onde:
- O usuário logado é a raiz (base da árvore)
- Ancestrais sobem em níveis: Pais → Avós → Bisavós
- Cada nível mostra claramente a quantidade esperada (1, 2, 4, 8)
- Placeholders visuais para posições não preenchidas
- Conexões visuais entre gerações
- Layout responsivo e intuitivo
