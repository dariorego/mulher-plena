

## Plano: Aplicar cores configuráveis a todos os botões `default`

### Abordagem

A forma mais eficiente é modificar o componente `Button` centralmente para que botões com variant `default` (o principal) apliquem automaticamente as cores de `SettingsContext`. Isso evita editar 58 arquivos individualmente.

### Alteração

**`src/components/ui/button.tsx`**

- Importar `useSettings` do `SettingsContext`
- No componente `Button`, quando `variant` é `default` (ou não especificado), aplicar `style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}` inline, sobrescrevendo as classes Tailwind de cor
- Para variantes `destructive`, `outline`, `ghost`, `secondary`, `link` — manter o comportamento atual (não aplicar as cores customizadas)
- Tratar o caso onde o `Button` está fora do `SettingsProvider` (ex: em testes) com um try/catch ou contexto opcional

### Resultado

Todos os ~1039 usos de `<Button>` com variant `default` passam a usar as cores configuradas automaticamente, sem precisar editar nenhum outro arquivo.

