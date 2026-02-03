
# Plano: Tornar a Árvore Genealógica Mais Triangular e Comprida

## Objetivo
Modificar a visualização da árvore para ter um formato **triangular** (estreito no topo, expandindo para a base) e **mais comprida** (maior altura vertical).

---

## Alterações Visuais

### Antes (Atual)
- Formato: Oval/elíptico (quase circular)
- BorderRadius: Arredondado em todas as direções
- Espaçamento vertical: Pequeno entre níveis

### Depois (Proposto)
- Formato: Triangular (pinheiro/árvore de Natal)
- Largura: Estreito no topo → largo na base
- Altura: Aumentada com mais espaço entre níveis

---

## Arquivo a Modificar

**`src/components/activities/FamilyTreeActivity.tsx`**

### 1. Mudar o Formato do Container (linha 218-230)
```css
/* De: oval arredondado */
borderRadius: '50% 50% 48% 48% / 35% 35% 55% 55%'

/* Para: triangular com clip-path */
clipPath: 'polygon(50% 0%, 8% 100%, 92% 100%)'
borderRadius: '0'
```

### 2. Aumentar o Padding Vertical
```css
/* De */
padding: '35px 15px 40px 15px'

/* Para */
padding: '40px 20px 50px 20px'
```

### 3. Aumentar o Gap Entre Níveis
```css
/* De */
gap-3, mt-2, mt-1

/* Para */
gap-5, mt-4, mt-3
```

### 4. Ajustar os Gaps Horizontais por Nível
Para manter o formato triangular, cada nível terá gaps específicos:
- Nível 0 (Você): centralizado
- Nível 1 (Pais): gap pequeno
- Nível 2 (Avós): gap menor
- Nível 3 (Bisavós): gap mínimo

---

## Detalhes Técnicos

### Container Principal (AncestralTreeVisualization)
Substituir `borderRadius` por `clipPath` com formato de triângulo:

```typescript
style={{
  background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 40%, #0D4A0D 100%)',
  padding: '45px 25px 55px 25px',
  clipPath: 'polygon(50% 0%, 5% 100%, 95% 100%)',
  border: 'none',
  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
}}
```

### Ajustar Espaçamentos Verticais
```typescript
<div className="relative flex flex-col items-center gap-5" style={{ zIndex: 2 }}>
  {/* Level 0 */}
  <div className="flex flex-col items-center">...</div>
  
  {/* Level 1 */}
  <div className="flex flex-col items-center mt-4">...</div>
  
  {/* Level 2 */}
  <div className="flex flex-col items-center mt-4">...</div>
  
  {/* Level 3 */}
  <div className="flex flex-col items-center mt-3">...</div>
</div>
```

### Adicionar Borda Triangular
Como `clipPath` remove bordas, criar um wrapper com SVG ou pseudo-elemento para a borda marrom.

---

## Visual Esperado

```text
        ⭐
       /  \
      / Você \
     /   []   \
    /  Pais    \
   /  []  []    \
  /    Avós      \
 / [] [] [] []    \
/    Bisavós       \
[][][][][][][][][]
------------------
       |||
      =====
```

---

## Resumo das Alterações

| Aspecto | Atual | Novo |
|---------|-------|------|
| Forma | Oval | Triangular |
| Altura | ~350px | ~420px |
| Gap vertical | 12px | 20px |
| Borda | Oval marrom | Triangular marrom |
| Estrela | Dentro | No topo do triângulo |
