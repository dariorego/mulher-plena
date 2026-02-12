

# Avaliacao Inline -- Substituir Pop-up por Visualizacao na Pagina

## Resumo

Substituir o modal (Dialog) de avaliacao por uma visualizacao expandida inline na propria pagina. Ao clicar em "Avaliar", o conteudo completo da submissao sera exibido diretamente abaixo do item selecionado (ou em uma secao dedicada), junto com os campos de nota e feedback -- eliminando pop-ups e o botao "Ver completo".

## Mudancas planejadas

### Arquivo: `src/pages/Evaluations.tsx`

1. **Remover o Dialog de avaliacao** (linhas 561-625) -- todo o bloco `<Dialog>` sera eliminado.

2. **Substituir por painel inline expandido** -- Ao clicar em "Avaliar", o item da lista se expande para mostrar:
   - O conteudo completo da submissao (sem `line-clamp`, sem `max-h-32` para imagens)
   - Todos os componentes especializados (SubmittedTimelineView, SubmittedLoveActionView, etc.) em tamanho completo
   - Campos de Nota e Feedback diretamente abaixo do conteudo
   - Botoes "Cancelar" e "Enviar Avaliacao"

3. **Remover o botao/link "Ver completo"** -- como o conteudo ja sera exibido por inteiro, nao ha necessidade desse link.

4. **Layout expandido** -- O painel inline ocupara toda a largura disponivel, com o conteudo da resposta sem restricoes de altura ou truncamento.

## Detalhes Tecnicos

### Estrutura do item expandido

Cada item da lista de pendentes tera dois estados:
- **Colapsado** (padrao): mostra participante, jornada, estacao, atividade e botao "Avaliar" (como ja funciona)
- **Expandido** (ao clicar "Avaliar"): expande para mostrar o conteudo completo + campos de avaliacao

```text
+-------------------------------------------------------------------+
| [icone] Participante                                              |
| Jornada > Estacao                                                 |
| Titulo da Atividade                     [Avaliar] [Excluir]       |
+-------------------------------------------------------------------+
|  Resposta do aluno:                                               |
|  [Conteudo completo - tabela, imagem, texto, etc.]                |
|                                                                   |
|  Nota (0-100): [________]                                         |
|  Feedback: [________________________]                             |
|                                                                   |
|  [Cancelar]  [Enviar Avaliacao]                                   |
+-------------------------------------------------------------------+
```

### Logica de estado

- `selectedSubmission` continua sendo usado, mas agora controla qual item esta expandido na lista (em vez de abrir um modal)
- Ao clicar "Avaliar" em outro item, o anterior fecha e o novo abre
- Ao clicar "Cancelar" ou "Enviar Avaliacao", o painel fecha

### Conteudo completo sem restricoes

- Imagens: removido `max-h-32` e `line-clamp-6`, exibidas em tamanho natural
- Textos: sem `line-clamp`, exibidos por completo com `whitespace-pre-wrap`
- Componentes especializados: renderizados sem restricoes de tamanho

### Arquivos modificados

- **`src/pages/Evaluations.tsx`** -- unico arquivo alterado

