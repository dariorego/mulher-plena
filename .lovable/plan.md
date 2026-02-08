
# Plano: Atividade "Reflexao em Diario" - Estacao 2, Jornada 5

## Objetivo

Criar a atividade "Reflexao em Diario" para a Estacao 2 ("Preparando-se para a chegada do filho") da Jornada 5. A participante escreve reflexoes com frases que representam a manifestacao de amor ao ser divino que estara na fase intrauterina.

---

## Como Funciona

Esta e uma atividade de texto dissertativo (essay) que segue o fluxo padrao:

- A participante ve a orientacao completa
- Preenche uma caixa de texto com suas reflexoes e frases de manifestacao de amor
- Envia a atividade

Nenhum componente customizado e necessario.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade no banco

Apenas uma migracao SQL para inserir a atividade:

- **station_id:** `fe800d33-f2f8-4323-b43e-5a388bee0917` (Estacao 2 - Preparando-se para a chegada do filho)
- **title:** "Reflexao em Diario"
- **type:** `essay`
- **points:** 10
- **description:** Orientacao formatada em HTML explicando que a participante deve criar um diario com reflexoes e frases que representam a manifestacao de amor ao ser divino, incluindo a nota especial para gestantes sobre proferirem as palavras em voz alta

### Nenhuma alteracao em codigo

O sistema existente ja renderiza atividades do tipo essay automaticamente com a orientacao formatada em HTML e caixa de texto.

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade essay na Estacao 2 da Jornada 5 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 2 da Jornada 5, a aluna vera a atividade "Reflexao em Diario"
- A orientacao sera exibida explicando o objetivo do diario reflexivo e a nota para gestantes
- Uma caixa de texto permitira escrever as reflexoes e frases de manifestacao de amor
- Apos o envio, a aluna vera a confirmacao e sera redirecionada para a estacao
- Administradores poderao avaliar a submissao normalmente
- A atividade vale 10 pontos
