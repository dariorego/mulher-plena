

## Plano: Seção "Sugestão de Leitura" nas Estações

### O que será feito

Adicionar um campo opcional "Sugestão de Leitura" nas estações. Quando preenchido, será exibido na página da estação (abaixo do Material Complementar, antes da navegação entre estações) com um ícone de livro.

### Alterações

**1. Migração de Banco de Dados**

Adicionar coluna `reading_suggestion` (TEXT, nullable) na tabela `stations`.

**2. `src/types/index.ts`**

Adicionar `reading_suggestion?: string` na interface `Station`.

**3. `src/components/admin/StationForm.tsx`**

- Adicionar estado `readingSuggestion` inicializado com `station?.reading_suggestion`
- Adicionar campo de texto (Input ou Textarea) com label "Sugestão de Leitura" e placeholder "Ex: Livro Universo Feminino, pp. 15-22"
- Incluir `reading_suggestion` no submit do formulário

**4. `src/pages/StationDetail.tsx`**

Adicionar nova seção condicional (só aparece se `station.reading_suggestion` estiver preenchido), posicionada após o Material Complementar (linha ~511) e antes da navegação entre estações:

- Card com ícone `BookOpen` (lucide-react) e título "Sugestão de Leitura"
- Exibe o texto da sugestão em estilo destacado
- Visual consistente com os demais cards da página

**5. `src/integrations/supabase/types.ts`**

Verificar se o campo `reading_suggestion` precisa ser adicionado manualmente ao tipo gerado.

