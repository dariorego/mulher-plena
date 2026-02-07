

# Plano: Atividade "Carta Nao Enviada" - Estacao 2, Jornada 3

## Objetivo
Criar a atividade "Carta Nao Enviada" para a Estacao 2 ("Reconciliando-se com os pais") da Jornada 3. A participante escreve uma carta secreta a um de seus pais, como espaco seguro para expressar sentimentos. A carta nao sera enviada -- e uma atividade individual e reflexiva.

---

## Como Funciona

- A participante ve a orientacao completa com os topicos sugeridos (dor, sentimento, agradecimento, acao)
- Uma caixa de texto permite escrever a carta (minimo 100 caracteres)
- Apos finalizar, a participante envia a atividade
- A atividade aparece com a tag "Experiencias sensiveis" na descricao
- Nao ha compartilhamento no mural -- e totalmente individual e privada

---

## Abordagem

Esta atividade usa o formulario generico de ensaio ("essay") que ja existe na aplicacao. Nenhuma alteracao de codigo e necessaria. Basta inserir a atividade no banco de dados com o tipo correto.

O fluxo generico de essay ja oferece:
- Caixa de texto com minimo de 100 caracteres
- Exibicao da orientacao formatada
- Botao de envio
- Redirecionamento para a estacao apos envio

---

## Alteracao Necessaria

### Migracao SQL - Inserir atividade no banco

- **station_id:** `405871aa-1f2b-4c45-a5f2-73d2b52a01fc` (Estacao 2 - Reconciliando-se com os pais)
- **title:** "Carta Nao Enviada"
- **type:** `essay`
- **description:** Texto completo de orientacao, incluindo os topicos sugeridos e a nota sobre guardar/rasgar/jogar fora
- **points:** 10

---

## Resumo

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade do tipo essay na Estacao 2 da Jornada 3 |

Nenhuma alteracao de codigo e necessaria. O formulario generico de essay ja suporta todo o fluxo automaticamente.

---

## Resultado Esperado

- Ao acessar a Estacao 2 da Jornada 3, a aluna vera a atividade "Carta Nao Enviada"
- A orientacao completa sera exibida com os topicos sugeridos
- A caixa de texto permitira escrever a carta (minimo 100 caracteres)
- Apos o envio, a participante retorna para a pagina da estacao
- A atividade e totalmente individual e privada (sem opcao de compartilhamento)
