

# Plano: Atividade Final "Codigo de Etica do Amor Pleno" - Jornada 4

## Objetivo

Criar a atividade final de integracao "Codigo de Etica do Amor Pleno" para a Estacao de Integracao da Jornada 4 (station_id: `37a05a4d-2f5e-4698-b893-124846c13333`). A participante elabora 5 principios pessoais para cultivar uma relacao amorosa consciente e espiritualizada.

---

## Como Funciona

Esta e uma atividade de texto dissertativo (essay) que segue o mesmo padrao do "Manifesto Pessoal" da Jornada 1:

- A participante ve a orientacao completa com perguntas reflexivas e sugestoes de inicio de frase
- Preenche uma caixa de texto com seus 5 principios
- Envia a atividade

Nenhum componente customizado e necessario.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade no banco

Apenas uma migracao SQL para inserir a atividade:

- **station_id:** `37a05a4d-2f5e-4698-b893-124846c13333`
- **title:** "Codigo de Etica do Amor Pleno"
- **type:** `essay`
- **points:** 10
- **description:** Orientacao completa formatada em HTML, incluindo:
  - Introducao explicando o que e o Codigo de Etica
  - 4 perguntas reflexivas para guiar a elaboracao
  - Instrucao para escrever 5 principios pessoais
  - Sugestoes de expressoes iniciais ("Escolho...", "Decido...", "Me comprometo a...", "Prometo a mim mesma...")

### Nenhuma alteracao em codigo

O sistema existente ja renderiza atividades do tipo essay automaticamente com a orientacao formatada em HTML.

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade na Estacao de Integracao da Jornada 4 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao de Integracao da Jornada 4, a aluna vera a atividade "Codigo de Etica do Amor Pleno"
- A orientacao completa sera exibida com as perguntas reflexivas e sugestoes de expressoes
- Uma caixa de texto permitira escrever os 5 principios
- Apos o envio, a aluna vera a confirmacao
- Administradores poderao avaliar a submissao normalmente
- A atividade vale 10 pontos

