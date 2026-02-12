
# Corrigir Exibicao de HTML Nao Renderizado nas Descricoes de Atividades

## Problema

Quando o administrador cria descricoes de atividades usando o editor rich-text (que gera HTML como `<p>`, `<strong>`, `<ul>`, etc.), essas tags aparecem visíveis como texto cru para o participante, em vez de serem renderizadas como formatacao.

## Causa Raiz

No arquivo `src/pages/ActivityPage.tsx`, a funcao `parseDescription` (linha 283) tenta interpretar a descricao como markdown com marcadores `**`. Quando a descricao contem HTML em vez de markdown, o parse falha e o texto e exibido como texto puro via `{parsedDescription.intro}` (linha 1120), mostrando as tags HTML literalmente.

## Solucao

### Arquivo: `src/pages/ActivityPage.tsx`

1. **Detectar conteudo HTML na descricao** -- Verificar se a descricao contem tags HTML (`<p>`, `<strong>`, `<ul>`, etc.)

2. **Quando contem HTML**: Renderizar diretamente com `dangerouslySetInnerHTML` (como ja e feito nas atividades especiais e na secao gamificada), pulando o `parseDescription`

3. **Quando nao contem HTML**: Manter o comportamento atual do `parseDescription` para descricoes em texto puro/markdown

### Logica da mudanca (linhas 1107-1141)

Dentro do bloco de orientacao para atividades genericas (essay nao-especiais, quiz):
- Se a descricao contem tags HTML → renderizar com `dangerouslySetInnerHTML` e classes de formatacao
- Caso contrario → manter o `parseDescription` atual para intro/question/outro

### Nenhum outro arquivo precisa ser alterado

As demais paginas (StationDetail, JourneyDetail, LandingPage) ja utilizam `dangerouslySetInnerHTML` corretamente. Os componentes de atividades especiais tambem ja renderizam HTML via `dangerouslySetInnerHTML`.
