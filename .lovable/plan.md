

# Plano: Atividade "Mensagem de Gratidao" - Estacao 4, Jornada 3

## Objetivo

Criar a atividade "Mensagem de Gratidao" para a Estacao 4 ("Gratidao aos antepassados: base para uma familia feliz") da Jornada 3. A participante escreve uma mensagem de gratidao aos seus antepassados e compartilha no mural coletivo (Padlet). Esta e uma atividade compartilhada.

---

## Como Funciona

- A participante ve a orientacao formatada
- Escreve sua mensagem de gratidao no campo de texto
- Pode tambem gravar um audio (recurso ja existente no ForumBoard)
- Escolhe uma cor para o cartao
- Clica "Compartilhar" para publicar no mural coletivo
- Todas as participantes veem as mensagens umas das outras em tempo real

---

## Abordagem

Esta atividade usa o componente `ForumBoard` (Padlet/mural colaborativo) que ja existe na aplicacao. O tipo sera `forum`, que automaticamente:

- Renderiza a orientacao como HTML (sem tags visiveis)
- Exibe o formulario para escrever/gravar mensagens
- Permite escolher cor do cartao
- Mostra o mural com todas as postagens em grid responsivo
- Suporta atualizacoes em tempo real
- Administradores e professores podem moderar (excluir posts)

Nenhuma alteracao de codigo e necessaria. Basta inserir a atividade no banco de dados com o tipo `forum`.

---

## Alteracao Necessaria

### Migracao SQL - Inserir atividade no banco

- **station_id:** `969676f7-0b1d-450a-ba88-3fdd89ea7a4c` (Estacao 4 - Gratidao aos antepassados)
- **title:** "Mensagem de Gratidao"
- **type:** `forum`
- **description:** Texto de orientacao formatado em HTML
- **points:** 10

---

## Resumo

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade do tipo forum na Estacao 4 da Jornada 3 |

Nenhuma alteracao de codigo e necessaria. O componente ForumBoard ja suporta todo o fluxo automaticamente, incluindo orientacao HTML, escrita, audio, cores e mural compartilhado em tempo real.

---

## Resultado Esperado

- Ao acessar a Estacao 4 da Jornada 3, a aluna vera a atividade "Mensagem de Gratidao"
- A orientacao sera exibida formatada: "Com o coracao aberto, escreva uma mensagem de gratidao aos seus antepassados..."
- O mural colaborativo (Padlet) permitira escrever e compartilhar mensagens
- Todas as participantes verao as mensagens umas das outras em tempo real
- A atividade e compartilhada -- todas podem ver e interagir com o mural

