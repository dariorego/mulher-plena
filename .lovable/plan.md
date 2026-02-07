

# Plano: Atividade "Ensaio Reflexivo" - Estacao 4, Jornada 2

## Objetivo
Criar a atividade "Ensaio Reflexivo" para a Estacao 4 ("Maternidade: missao ou opcao?") da Jornada 2. A participante escreve um breve texto sobre o que a maternidade representa para ela, com opcao de compartilhar no mural coletivo.

---

## Como Funciona

- A participante ve a orientacao e uma caixa de texto para escrever seu ensaio
- Abaixo do campo de texto, ha um checkbox opcional para compartilhar a resposta no mural coletivo
- Minimo de 100 caracteres para enviar
- Apos o envio, redireciona para a pagina da estacao

---

## Estrutura da Interface

```text
+--------------------------------------------------+
| ENSAIO REFLEXIVO                                  |
+--------------------------------------------------+
| ORIENTACAO                                        |
| Escreva um breve texto ou faca um desenho sobre   |
| o que a maternidade representa para voce,         |
| independentemente de ser mae ou nao.              |
+--------------------------------------------------+
|                                                   |
| SUA RESPOSTA                                      |
| +----------------------------------------------+ |
| |                                              | |
| |  [caixa de texto]                            | |
| |                                              | |
| +----------------------------------------------+ |
| Minimo de 100 caracteres. Atual: 0               |
|                                                   |
| [ ] Compartilhar minha resposta no mural coletivo |
|                                                   |
| [======= Enviar Atividade =======]                |
+--------------------------------------------------+
```

---

## Abordagem

Esta atividade usa o formulario generico de ensaio ("essay") que ja existe na aplicacao. As unicas mudancas necessarias sao:

1. Adicionar o checkbox de compartilhamento opcional no formulario generico de essay, condicionado ao titulo da atividade
2. Inserir a atividade no banco de dados

---

## Alteracoes Necessarias

### 1. Modificar `src/pages/ActivityPage.tsx`

**Deteccao da atividade:**
- Adicionar funcao: `isEssayReflexivo = (title) => title.toLowerCase().includes('ensaio reflexivo')`
- Reutilizar o estado `shareManifesto` (ja existente) para controlar o checkbox de compartilhamento

**Bloco do essay generico (linhas 823-841):**
- Adicionar, logo abaixo do campo de texto e do contador de caracteres, um checkbox opcional de compartilhamento no mural coletivo (mesmo estilo visual do Manifesto), visivel apenas quando a atividade for "Ensaio Reflexivo"

**Logica de submit (funcao handleSubmit, linhas 173-249):**
- Adicionar condicao para postar no forum_posts quando `isEssayReflexivo` e `shareManifesto` estiver marcado, identico ao padrao ja usado para o Manifesto

### 2. Migracao SQL - Inserir atividade no banco

- station_id: `c852c067-e364-4b55-a430-d4285c3a940f` (Estacao 4 - Maternidade: missao ou opcao?)
- title: "Ensaio Reflexivo"
- type: `essay`
- description: "Escreva um breve texto ou faca um desenho sobre o que a maternidade representa para voce, independentemente de ser mae ou nao."
- points: 10

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/pages/ActivityPage.tsx` | Modificar | Adicionar checkbox de compartilhamento no essay generico e logica de post no forum |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 4 da Jornada 2 |

---

## Resultado Esperado

- Ao acessar a Estacao 4 da Jornada 2, a aluna vera a atividade "Ensaio Reflexivo"
- A orientacao sera exibida normalmente pelo fluxo generico de essay
- A caixa de texto permitira escrever o ensaio (minimo 100 caracteres)
- Um checkbox opcional permite compartilhar a resposta no mural coletivo
- Apos o envio, a participante retorna para a pagina da estacao

