
# Plano: Redesenhar Árvore da Gratidão com Visual de Árvore Real

## Resumo
Transformar a atividade "Árvore da Gratidão" em uma interface visual de árvore real, onde a participante preenche 15 caixas de texto separadas e os nomes aparecem dinamicamente na visualização da árvore.

## Nova Estrutura Visual

Baseado na imagem de referência, a árvore terá:

```text
         ┌─────────────────────────────────────┐
         │          COPA DA ÁRVORE             │
         │  ┌───────┐         ┌───────┐        │
         │  │ Avó 1 │         │ Avô 1 │        │  ← Nível 1 (2)
         │  └───────┘         └───────┘        │
         │  ┌───────┐         ┌───────┐        │
         │  │ Avó 2 │         │ Avô 2 │        │  ← Nível 2 (2)
         │  └───────┘         └───────┘        │
         │ ┌───┐┌───┐┌───┐┌───┐                │
         │ │Mãe││Pai││Tia││Tio│                │  ← Nível 3 (4)
         │ └───┘└───┘└───┘└───┘                │
         │┌───┐┌───┐┌───┐┌───┐┌───┐            │
         ││Irm││EU ││Pri││Pri││Côn│            │  ← Nível 4 (5)
         │└───┘└───┘└───┘└───┘└───┘            │
         │    ┌───┐┌───┐                       │
         │    │Fil││Fil│                       │  ← Nível 5 (2)
         │    └───┘└───┘                       │
         └─────────────────────────────────────┘
                      ║║║║
                      ║║║║  (Tronco)
                   ═══════════
```

### 15 Posições Organizadas:
1. **Linha 1 (Avós Maternos):** 2 posições
2. **Linha 2 (Avós Paternos):** 2 posições  
3. **Linha 3 (Pais e Tios):** 4 posições
4. **Linha 4 (Você, Irmãos, Primos, Cônjuge):** 5 posições
5. **Linha 5 (Filhos):** 2 posições

## Nova Experiência do Usuário

### Duas Áreas Separadas:

**1. Área de Entrada (Esquerda/Topo em mobile):**
- 15 campos de texto simples com labels
- Cada campo para digitar nome + aprendizado
- Organizado em seções por nível familiar

**2. Visualização da Árvore (Direita/Baixo em mobile):**
- Visual de árvore com copa verde (SVG/CSS)
- Tronco marrom
- Os nomes aparecem em "quadros" na copa
- Conforme digita, o nome aparece na árvore em tempo real
- Quadros vazios ficam com "?" ou pontilhado
- Quadros preenchidos mostram o nome com borda destacada

## Mudanças Técnicas

### Arquivo a Modificar:
`src/components/activities/FamilyTreeActivity.tsx`

### Principais Alterações:

1. **Novo Layout Split:**
   - Grid de 2 colunas em desktop
   - Stack vertical em mobile

2. **Componente TreeVisualization:**
   - Copa da árvore com gradiente verde
   - Slots posicionados para cada membro
   - Animação suave ao preencher

3. **Componente InputSection:**
   - 15 inputs agrupados por nível
   - Campo de nome
   - Campo de aprendizado

4. **Nova Estrutura de Dados:**
```typescript
const treePositions = [
  { id: 0, label: 'Avó Materna', row: 1, col: 1 },
  { id: 1, label: 'Avô Materno', row: 1, col: 2 },
  { id: 2, label: 'Avó Paterna', row: 2, col: 1 },
  { id: 3, label: 'Avô Paterno', row: 2, col: 2 },
  // ... 11 mais posições
];
```

5. **Estilo Visual da Árvore:**
   - Copa: Formato oval/circular com gradiente verde
   - Tronco: Retângulo marrom central
   - Quadros: Cards com borda decorativa laranja/marrom
   - Linhas conectoras entre níveis

## Design Visual

### Cores (Baseado na Imagem):
- Copa da árvore: `#7CB342` a `#558B2F` (gradiente verde)
- Tronco: `#795548` (marrom)
- Quadros dos membros: `#FFF3E0` com borda `#FF8A65`
- Labels: Fundo `#A5D6A7` (verde claro)
- Nomes preenchidos: Texto `#5D4037` (marrom escuro)

### Responsividade:
- **Desktop:** Árvore visual à direita, inputs à esquerda
- **Tablet:** Árvore em cima, inputs embaixo
- **Mobile:** Lista vertical com mini-preview da árvore

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/activities/FamilyTreeActivity.tsx` | Reescrever | Novo layout com visualização de árvore real |

## Fluxo de Interação

1. Participante vê a árvore vazia com 15 quadros em "?"
2. Na seção de inputs, ela preenche nome e aprendizado
3. Conforme digita, o nome aparece no quadro correspondente na árvore
4. Quadros preenchidos ganham destaque visual (borda, cor)
5. Indicador mostra progresso (X/15 preenchidos)
6. Mínimo de 3 para habilitar envio

## Resultado Final

Uma experiência visual interativa onde a participante "constrói" sua árvore genealógica visualmente, vendo os nomes aparecerem na estrutura da árvore conforme preenche os campos.
