

# Plano: Atividade "Frases de Apoio" - Estacao 5, Jornada 4

## Objetivo

Criar a atividade de texto dissertativo para a Estacao 5 ("Violencia contra a mulher: como superar?") da Jornada 4. A participante escreve no minimo tres frases de apoio, forca ou valorizacao para uma mulher em momento dificil.

---

## Como Funciona

Esta e uma atividade de texto dissertativo simples (essay) que utiliza o fluxo padrao ja existente na plataforma:

- A participante ve a orientacao formatada
- Preenche uma caixa de texto com as frases de apoio
- Envia a atividade

Nao ha necessidade de componente customizado. A orientacao sera inserida com HTML formatado no campo `description` do banco.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade no banco

- **station_id:** `0c9ff813-d71a-4ffa-9e34-19ac55bc6a07` (Estacao 5 - Violencia contra a mulher: como superar?)
- **title:** "Frases de Apoio e Valorização"
- **type:** `essay`
- **description:** Orientacao formatada em HTML:

> Escreva no minimo tres frases de apoio, forca ou valorizacao que gostaria de dizer a uma mulher que esta passando por um momento dificil (ex.: "Voce merece ser respeitada e amada do jeito que e", "Sua vida tem valor", "Voce nao esta sozinha").

- **points:** 10

### Nenhuma alteracao em codigo

O sistema existente ja renderiza atividades do tipo essay automaticamente:
- A orientacao sera exibida na secao "Orientacao"
- A caixa de texto padrao sera exibida
- O botao de envio padrao sera exibido
- A visualizacao apos envio usara o bloco generico
- Administradores poderao avaliar normalmente

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade na Estacao 5 da Jornada 4 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 5 da Jornada 4, a aluna vera a atividade "Frases de Apoio e Valorizacao"
- A orientacao sera exibida com a instrucao de escrever frases de apoio
- Uma caixa de texto permitira escrever as frases
- Apos o envio, a aluna vera a confirmacao
- Administradores poderao avaliar a submissao normalmente
- A atividade vale 10 pontos

