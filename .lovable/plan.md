

## Plano: Visualização da Árvore Genealógica Enviada em Formato de Fluxograma

### Problema Atual
Quando a atividade "Árvore da Gratidão" é enviada, a resposta é exibida como texto markdown genérico (lista de nomes). O usuário quer ver a mesma visualização em árvore (fluxograma com conexões) que aparece durante o preenchimento.

### Solução

Criar um componente `SubmittedFamilyTreeView` que faz o parse do conteúdo markdown salvo e reconstrói a visualização em árvore com conexões SVG, reutilizando o visual já existente do `FamilyTreeActivity`. Garantir responsividade para mobile.

### Alterações

**1. Novo componente: `src/components/activities/SubmittedFamilyTreeView.tsx`**

- Recebe `content: string` (markdown da submissão)
- Faz parse do markdown para extrair os nomes por nível/relação
- Reconstrói o array de `Ancestor[]` a partir do conteúdo
- Renderiza a mesma `AncestralTreeVisualization` + `TreeTrunk` usados no formulário de preenchimento
- Layout responsivo: em mobile, os nodes se ajustam com tamanhos menores

**2. Refatorar `src/components/activities/FamilyTreeActivity.tsx`**

- Exportar os componentes internos `AncestralTreeVisualization`, `TreeTrunk` e a interface `Ancestor` para que o `SubmittedFamilyTreeView` possa reutilizá-los
- Exportar também `createTreeStructure` para reconstruir a árvore a partir do parse

**3. Atualizar `src/pages/ActivityPage.tsx`**

- Importar `SubmittedFamilyTreeView`
- Adicionar um bloco dedicado para `existingSubmission && isFamilyTreeActivity(activity.title)` (similar aos outros tipos especiais como LoveWheel, Timeline, etc.)
- Dentro desse bloco, renderizar o `SubmittedFamilyTreeView` com o conteúdo da submissão, seguido do feedback da mentora

### Lógica de Parse do Conteúdo

O conteúdo salvo tem o formato:
```
### Você
- **Você:** Maria

### Pais
- **Mãe:** Ana
- **Pai:** João
```

O parse usa regex para extrair relação e nome de cada linha `- **Relação:** Nome`, mapeando para os IDs corretos da árvore.

