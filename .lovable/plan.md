

# Plano: Atividade "Carta de Gratidao" - Estacao 4, Jornada 4

## Objetivo

Criar a atividade "Carta de Gratidao" para a Estacao 4 ("Sogro e Sogra: Pais espirituais") da Jornada 4. A participante redige uma carta simbolica expressando gratidao aos sogros, destacando ao menos tres qualidades ou ensinamentos.

---

## Como Funciona

Esta e uma atividade de texto dissertativo simples (essay) que utiliza o fluxo padrao ja existente na plataforma:

- A participante ve a orientacao formatada
- Preenche uma caixa de texto com a carta de gratidao
- Envia a atividade

Nao ha necessidade de um componente customizado, pois a atividade segue exatamente o padrao de "Texto Dissertativo" ja suportado pelo sistema. A orientacao sera inserida com HTML formatado diretamente no campo `description` do banco.

---

## Alteracoes Necessarias

### 1. Migracao SQL - Inserir atividade no banco

Apenas uma migracao SQL para inserir a atividade:

- **station_id:** `b4153826-dbb0-458b-b920-e64cbb2aa0f9` (Estacao 4 - Sogro e Sogra: Pais espirituais)
- **title:** "Carta de Gratidão"
- **type:** `essay`
- **description:** Texto de orientacao formatado:

```
Redija uma carta simbólica (que não precisa ser entregue) expressando gratidão aos seus sogros. Destaque ao menos três qualidades ou ensinamentos que reconhece neles e que contribuíram para sua jornada.
```

- **points:** 10

### Nenhuma alteracao em codigo

Como esta atividade usa o fluxo padrao de "Texto Dissertativo" (essay), ela sera automaticamente renderizada pelo sistema existente:

- A orientacao sera exibida na secao "Orientacao" com o parser de descricao
- A caixa de texto padrao para essay sera exibida
- O botao de envio padrao sera exibido
- A visualizacao apos envio usara o bloco generico de "Atividade ja enviada"
- Nas paginas de avaliacao, o conteudo sera exibido como texto simples

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Inserir atividade na Estacao 4 da Jornada 4 |

Nenhum arquivo de codigo precisa ser alterado.

---

## Resultado Esperado

- Ao acessar a Estacao 4 da Jornada 4, a aluna vera a atividade "Carta de Gratidao"
- A orientacao sera exibida com a instrucao de redigir uma carta simbolica
- Uma caixa de texto permitira escrever a carta
- Apos o envio, a aluna vera a confirmacao de envio
- Administradores poderao avaliar a submissao normalmente nas paginas de avaliacao
- A atividade vale 10 pontos

