

# Plano: Atividade Forum "A Mulher que eu Quero Ser" - Estacao 5, Jornada 2

## Objetivo
Criar a atividade "Forum: A Mulher que eu Quero Ser" para a Estacao 5 ("A mulher dos novos tempos") da Jornada 2. E uma atividade colaborativa (Padlet) onde as participantes compartilham imagens ou frases sobre a forca feminina que as inspira.

---

## Como Funciona

- A atividade utiliza o tipo `forum` (Foro Colaborativo), que ja existe na aplicacao
- O componente `ForumBoard` ja implementa toda a funcionalidade de Padlet: posts coloridos, texto, audio, exclusao, visualizacao em grid e atualizacao em tempo real
- A participante ve a orientacao e pode postar reflexoes no mural coletivo
- Todos os posts sao visiveis para todas as participantes em tempo real

---

## Abordagem

Esta atividade nao requer nenhuma alteracao de codigo. O tipo `forum` ja e renderizado automaticamente pelo `ForumBoard` no `ActivityPage.tsx` (linhas 978-984). Basta inserir a atividade no banco de dados com o tipo correto.

---

## Alteracao Necessaria

### Migracao SQL - Inserir atividade no banco

- **station_id:** `a7243ecb-3494-4677-b6c7-e9e5c0a343d7` (Estacao 5 - A mulher dos novos tempos)
- **title:** "Fórum: A Mulher que eu Quero Ser"
- **type:** `forum`
- **description:** Texto de orientacao com a instrucao da atividade
- **points:** 10

---

## Resumo

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade do tipo `forum` na Estacao 5 |

Nenhuma alteracao de codigo e necessaria, pois o componente ForumBoard ja suporta todo o fluxo de atividades do tipo forum automaticamente.

---

## Resultado Esperado

- Ao acessar a Estacao 5 da Jornada 2, a aluna vera a atividade "Forum: A Mulher que eu Quero Ser"
- A orientacao sera exibida no topo do mural
- A participante podera compartilhar textos e audios com cores personalizadas
- Todos os posts serao visiveis em tempo real para todas as participantes
- Professores e admins podem excluir posts

