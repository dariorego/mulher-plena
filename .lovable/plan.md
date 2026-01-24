
# Plano: Inverter Árvore e Adicionar Visual de Pinheiro com Linhas de Conexão

## Resumo
Modificar a visualização da árvore genealógica para inverter a ordem (Você no topo), criar um formato de pinheiro triangular, e adicionar linhas SVG conectando cada par de pais aos seus filhos.

## Nova Estrutura Visual

```text
                    ┌───────┐
                    │  Você │  ← Nível 0 (topo)
                    └───┬───┘
                        │
            ┌───────────┴───────────┐
            │                       │
        ┌───────┐               ┌───────┐
        │  Mãe  │               │  Pai  │  ← Nível 1
        └───┬───┘               └───┬───┘
            │                       │
    ┌───────┴───────┐       ┌───────┴───────┐
    │               │       │               │
┌───────┐       ┌───────┐ ┌───────┐     ┌───────┐
│ Avó M │       │ Avô M │ │ Avó P │     │ Avô P │  ← Nível 2
└───┬───┘       └───┬───┘ └───┬───┘     └───┬───┘
    │               │         │             │
    ├─┬─┐       ┌─┬─┤     ┌─┬─┤         ┌─┬─┤
    ▼ ▼         ▼ ▼       ▼ ▼           ▼ ▼
┌─┐┌─┐       ┌─┐┌─┐     ┌─┐┌─┐       ┌─┐┌─┐
│B││B│       │B││B│     │B││B│       │B││B│  ← Nível 3 (base)
└─┘└─┘       └─┘└─┘     └─┘└─┘       └─┘└─┘
        8 Bisavós na base (mais largo)
```

## Mudanças Visuais

### 1. Ordem Invertida
- **Topo**: Você (1)
- **2o nível**: Pais (2)
- **3o nível**: Avós (4)
- **Base**: Bisavós (8) - a parte mais larga da árvore

### 2. Formato Pinheiro (Triangular)
- Copa triangular com gradiente verde
- Largura aumenta a cada nível inferior
- Base larga com os 8 bisavós
- Tronco removido ou reposicionado para o topo (como decoração)

### 3. Linhas de Conexão SVG
- Linhas partem do centro inferior de cada pessoa
- Conectam aos centros superiores dos dois pais
- Formato em "V" invertido ligando pares
- Cor marrom semi-transparente (#795548)
- Linhas calculadas dinamicamente com base nas posições

## Implementação Técnica

### Alterações no componente `AncestralTreeVisualization`

1. **Inverter ordem dos níveis renderizados**:
   - Renderizar Nível 0 (Você) primeiro (topo)
   - Depois Nível 1 (Pais)
   - Depois Nível 2 (Avós)
   - Por último Nível 3 (Bisavós)

2. **Fundo com forma de pinheiro**:
   - SVG com clip-path triangular ou polígono
   - Gradiente verde escurecendo para a base

3. **Linhas de conexão com useRef e cálculo de posições**:
   - Usar refs para capturar posições dos cards
   - Desenhar SVG path entre pai/mãe e filho
   - Usar coordenadas relativas ao container

4. **Espaçamento proporcional**:
   - Nível 0: gap mínimo (1 card)
   - Nível 1: gap médio (2 cards)
   - Nível 2: gap maior (4 cards)
   - Nível 3: gap máximo (8 cards, linha inteira)

### Alterações na ordem de renderização

```tsx
// Ordem invertida para renderização
const LEVELS_VISUAL_ORDER = [
  { level: 0, title: 'Você', count: 1, color: '#4CAF50' },
  { level: 1, title: 'Pais', count: 2, color: '#FF9800' },
  { level: 2, title: 'Avós', count: 4, color: '#2196F3' },
  { level: 3, title: 'Bisavós', count: 8, color: '#9C27B0' },
];
```

### Componente de Linhas Melhorado

```tsx
function ConnectionLinesSVG({ ancestors }: { ancestors: Ancestor[] }) {
  // Para cada pessoa dos níveis 0-2, desenhar linhas para seus pais
  // Exemplo: Você → Mãe e Pai
  //          Mãe → Avó Materna e Avô Materno
  // Usa posições calculadas baseadas no layout grid
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Linhas de Você para Pais */}
      <path d="M centerX,bottomY L leftParentX,topY" stroke="#795548" />
      <path d="M centerX,bottomY L rightParentX,topY" stroke="#795548" />
      {/* ... mais linhas */}
    </svg>
  );
}
```

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/activities/FamilyTreeActivity.tsx` | Modificar componente `AncestralTreeVisualization` |

## Detalhes da Implementação

### Layout CSS para forma de pinheiro:
- Container com clip-path triangular ou bordas arredondadas
- Padding aumentando na base para acomodar mais cards
- Fundo com gradiente verde de árvore

### Cálculo das linhas:
- Cada nível tem posições X conhecidas (baseado no grid)
- Linha vertical do filho até um ponto médio
- Duas linhas diagonais do ponto médio para cada pai
- Usar `position: relative` no container e `absolute` nos elementos

### Responsividade:
- Em telas pequenas, reduzir tamanho dos cards
- Linhas escalam proporcionalmente
- Scroll horizontal se necessário para os 8 bisavós

## Resultado Visual Esperado

Uma árvore genealógica em formato de pinheiro/triângulo onde:
- "Você" aparece no topo (ponta do triângulo)
- Os níveis expandem para baixo como galhos
- Linhas conectam visualmente cada pessoa aos seus pais
- Os 8 bisavós formam a base larga da árvore
- Formato visualmente similar a uma árvore de natal invertida
