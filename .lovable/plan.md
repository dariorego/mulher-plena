

# Plano: Atividade "Manifestar o amor que liberta" (Quiz) - Estacao 1, Jornada 5

## Objetivo

Criar a atividade quiz "Manifestar o amor que liberta" para a Estacao 1 ("Os filhos sao de Deus") da Jornada 5. A participante responde 3 perguntas de multipla escolha sobre o tema.

---

## Como Funciona

Esta e uma atividade do tipo `quiz` que utiliza o fluxo padrao ja existente na plataforma:

- A participante ve as 3 perguntas com alternativas (radio buttons)
- Seleciona uma resposta para cada pergunta
- Envia a atividade
- O sistema calcula automaticamente a pontuacao com base nas respostas corretas

Nenhum componente customizado e necessario. O sistema ja renderiza quiz_questions automaticamente com RadioGroup.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade e perguntas no banco

**Atividade:**
- **station_id:** `941586e4-bbe4-464e-bb4d-41717fe5498b` (Estacao 1 - Os filhos sao de Deus)
- **title:** "Manifestar o amor que liberta"
- **type:** `quiz`
- **points:** 10

**Perguntas (tabela quiz_questions):**

| # | Pergunta | Opcoes | Resposta correta (indice) |
|---|----------|--------|--------------------------|
| 1 | O que significa reconhecer que os filhos sao de Deus? | (a) Que devemos controlar suas escolhas, (b) Que devemos ve-los como seres espirituais perfeitos, (c) Que pertencem a familia humana | 1 (opcao b) |
| 2 | O amor verdadeiro e aquele que... | (a) Impoe condicoes, (b) Liberta e confia, (c) Depende da reciprocidade | 1 (opcao b) |
| 3 | Quando vemos o outro como filho de Deus, o que muda em nos? | (a) O medo cresce, (b) O coracao se ilumina, (c) Ficamos indiferentes | 1 (opcao b) |

### Nenhuma alteracao em codigo

O sistema existente ja renderiza atividades do tipo quiz automaticamente:
- As perguntas sao carregadas da tabela `quiz_questions`
- Cada pergunta exibe alternativas com radio buttons
- O botao de envio so fica habilitado quando todas as perguntas foram respondidas
- A pontuacao e calculada automaticamente com base nas respostas corretas
- A visualizacao pos-envio mostra o resultado

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade quiz e 3 perguntas na Estacao 1 da Jornada 5 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 1 da Jornada 5, a aluna vera a atividade "Manifestar o amor que liberta"
- Serao exibidas 3 perguntas com alternativas em formato de radio buttons
- A aluna seleciona uma resposta por pergunta e envia
- O sistema calcula a pontuacao automaticamente (ex: 2 de 3 corretas = 67%)
- Administradores poderao ver as respostas normalmente
- A atividade vale 10 pontos

