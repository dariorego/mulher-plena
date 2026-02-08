

# Plano: Atividade "Roteiro de Acao Amorosa" (Forum) - Estacao 3, Jornada 5

## Objetivo

Criar a atividade compartilhada "Roteiro de Acao Amorosa" para a Estacao 3 ("Educacao intrauterina") da Jornada 5. As participantes elaboram acoes praticas para substituir medo e culpa por atitudes amorosas e compassivas, compartilhando no mural coletivo (padlet).

---

## Como Funciona

Esta e uma atividade do tipo `forum` que utiliza o mural interativo (estilo Padlet) ja existente na plataforma:

- As participantes veem a orientacao
- Podem compartilhar textos e audios em cartoes coloridos no mural
- As postagens sao visiveis para todas as participantes em tempo real
- Administradores e professores podem moderar (excluir postagens)

Nenhum componente customizado e necessario. O sistema ja renderiza atividades do tipo forum automaticamente com o componente ForumBoard.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade no banco

Apenas uma migracao SQL para inserir a atividade:

- **station_id:** `9a4a858d-ca4c-44bc-95a0-b14ac3761268` (Estacao 3 - Educacao intrauterina)
- **title:** "Roteiro de Acao Amorosa"
- **type:** `forum`
- **points:** 10
- **description:** Orientacao formatada em HTML explicando que a participante deve elaborar uma lista de acoes praticas para substituir sentimentos de medo ou culpa por atitudes mais amorosas, compassivas e alinhadas com o cuidado consigo e com o outro

### Nenhuma alteracao em codigo

O sistema existente ja renderiza atividades do tipo forum automaticamente com o componente ForumBoard (mural estilo Padlet).

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade forum na Estacao 3 da Jornada 5 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 3 da Jornada 5, a aluna vera a atividade "Roteiro de Acao Amorosa"
- A orientacao sera exibida explicando o objetivo da atividade
- O mural interativo (padlet) permitira compartilhar textos e audios em cartoes coloridos
- As postagens serao visiveis para todas as participantes em tempo real
- Administradores poderao moderar as postagens
- A atividade vale 10 pontos

