
# Plano: Atividade "Registro de Inspiracao" - Estacao 1, Jornada 7

## Objetivo

Criar a atividade "Registro de Inspiracao" para a Estacao 1 ("A mulher que transforma o lar e a sociedade") da Jornada 7 ("Mulher da Nova Civilizacao"). As participantes compartilham exemplos concretos de transformacao positiva no lar ou na sociedade em um mural colaborativo (Padlet).

---

## Como Funciona

Esta e uma atividade do tipo `forum` (mural interativo estilo Padlet), que ja esta totalmente implementada no sistema. Nao requer nenhum componente novo — o `ForumBoard` existente cuida de tudo.

- A participante ve a orientacao sobre como descrever a transformacao
- Escreve seu registro de inspiracao no mural
- Pode opcionalmente gravar um audio
- O post e compartilhado no mural coletivo em cartoes coloridos
- Todas as participantes visualizam os registros umas das outras em tempo real

---

## Alteracao Necessaria

### Migracao SQL (unica alteracao)

Inserir a atividade no banco de dados:

- **station_id:** `137c81bd-11cb-4ee1-b54c-b99212bc61b7` (Estacao 1 - A mulher que transforma o lar e a sociedade)
- **title:** "Registro de Inspiracao"
- **type:** `forum`
- **points:** 10
- **description:** Orientacao formatada em HTML explicando que a participante deve apresentar um exemplo concreto de transformacao positiva (contexto inicial, atitude/mudanca adotada e efeitos positivos percebidos)

Nenhuma alteracao em codigo e necessaria — o componente ForumBoard ja renderiza automaticamente todas as atividades do tipo `forum`.

---

## Resumo

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade forum na Estacao 1 da Jornada 7 |

Nenhum arquivo de codigo sera alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 1 da Jornada 7, a aluna vera a atividade "Registro de Inspiracao"
- A orientacao sera exibida explicando como descrever a transformacao positiva
- O mural interativo permitira compartilhar textos e audios em cartoes coloridos
- Todas as participantes poderao ver os registros umas das outras em tempo real
- A atividade vale 10 pontos
