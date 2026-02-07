

# Plano: Atividade "Carta Nao Enviada" - Componente Customizado com Efeitos Visuais

## Objetivo
Transformar a atividade "Carta Nao Enviada" de um formulario generico de essay para uma experiencia customizada com:
- Orientacao renderizada como HTML (sem tags aparecendo)
- Confirmacao antes de enviar
- Tres botoes de acao apos o envio: **Guardar**, **Rasgar**, **Jogar Fora**
- Efeitos visuais para cada acao

---

## Problemas Atuais

1. **Tags HTML visiveis**: A descricao da atividade foi salva com HTML (`<p>`, `<ul>`, `<li>`), mas o formulario generico de essay renderiza o texto como string pura, mostrando as tags
2. **Sem interacao pos-envio**: O fluxo generico apenas marca como "enviada" sem opcoes adicionais

---

## Como Vai Funcionar

### Fluxo da Participante

1. A participante abre a atividade e ve a orientacao formatada corretamente (sem tags HTML)
2. Escreve sua carta no campo de texto (minimo 100 caracteres)
3. Ao clicar "Enviar", aparece um dialogo de confirmacao: "Deseja realmente enviar sua carta?"
4. Apos confirmar, a carta e salva e aparecem tres botoes de acao:
   - **Guardar**: A carta permanece salva normalmente. Mensagem de confirmacao aparece
   - **Rasgar**: Efeito visual de "rasgar papel" (animacao CSS com rotacao, escala e fragmentacao). Apos o efeito, o conteudo e ocultado e a submissao e atualizada para indicar que foi rasgada
   - **Jogar Fora**: Efeito de desaparecimento gradual (fade out com reducao de opacidade). Apos o efeito, o conteudo e apagado

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/UnsentLetterActivity.tsx`

Novo componente dedicado para a atividade "Carta Nao Enviada":

- **Props:** `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- **Orientacao:** Renderizada com `dangerouslySetInnerHTML` para interpretar o HTML da descricao
- **Campo de texto:** Textarea para escrever a carta (minimo 100 caracteres)
- **Dialogo de confirmacao:** AlertDialog perguntando "Deseja realmente enviar sua carta?" com botoes "Sim, enviar" e "Cancelar"
- **Pos-envio - tres botoes:**
  - "Guardar" (icone de arquivo/salvar): Exibe mensagem "Sua carta foi guardada com carinho" e mantem o conteudo salvo
  - "Rasgar" (icone de tesoura): Anima o conteudo com efeito de rasgar (CSS transform + clip-path + rotacao) e depois atualiza a submissao para conteudo "[Carta rasgada pela participante]"
  - "Jogar Fora" (icone de lixeira): Anima o conteudo com fade out gradual e depois deleta a submissao do banco

### 2. Modificar `src/pages/ActivityPage.tsx`

- Adicionar funcao de deteccao: `isUnsentLetter = (title) => title.toLowerCase().includes('carta n') && title.toLowerCase().includes('enviada')`
- Importar `UnsentLetterActivity`
- Adicionar bloco de renderizacao no formulario (junto com as demais atividades especiais)
- Adicionar bloco de "Already Submitted" especifico para a Carta Nao Enviada (mostrando os 3 botoes de acao)
- Excluir da orientacao generica e do footer de submit padrao

### 3. Adicionar funcao `updateSubmissionContent` no `src/contexts/DataContext.tsx`

Nova funcao para atualizar apenas o conteudo de uma submissao (usada pelo botao "Rasgar"):
- Recebe `id` e `newContent`
- Atualiza o campo `content` na tabela `activity_submissions`
- Atualiza o estado local

---

## Detalhes Tecnicos

### Efeito "Rasgar"

Animacao CSS com keyframes personalizados:
- O conteudo da carta se divide visualmente em dois fragmentos
- Cada fragmento rotaciona e se move em direcoes opostas
- Opacidade reduz gradualmente
- Duracao: ~1.5 segundos
- Apos a animacao, o conteudo e substituido por "[Carta rasgada pela participante]"

### Efeito "Jogar Fora"

Animacao CSS mais simples:
- O conteudo reduz de opacidade de 1 para 0
- Leve movimento para baixo (translateY)
- Leve reducao de escala
- Duracao: ~2 segundos
- Apos a animacao, a submissao e deletada do banco

### Deteccao da Atividade

```
const isUnsentLetter = (title: string) =>
  title.toLowerCase().includes('carta n') &&
  title.toLowerCase().includes('enviada');
```

Cobre tanto "Carta Nao Enviada" quanto "Carta Não Enviada" (com ou sem acento).

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/UnsentLetterActivity.tsx` | Criar | Componente com formulario, confirmacao e 3 botoes de acao pos-envio |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar componente, deteccao, bloco de submissao e exclusoes |
| `src/contexts/DataContext.tsx` | Modificar | Adicionar funcao `updateSubmissionContent` |

---

## Resultado Esperado

- A orientacao sera exibida corretamente, sem tags HTML visiveis
- Apos escrever a carta, a participante vera um dialogo de confirmacao antes do envio
- Apos enviar, tres botoes aparecerao: Guardar, Rasgar e Jogar Fora
- "Guardar" mantem a carta salva com mensagem de confirmacao
- "Rasgar" exibe efeito visual de papel sendo rasgado e oculta o conteudo
- "Jogar Fora" exibe efeito de desaparecimento gradual e apaga a submissao
- A atividade e totalmente individual e privada

