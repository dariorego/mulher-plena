
# Plano: Atividade "Linha da Vida" - Timeline Interativa

## Objetivo
Criar uma atividade especial chamada "Linha da Vida" com um mecanismo interativo de construcao de linha do tempo, onde o aluno indica pelo menos 5 momentos positivos e marcantes da sua vida, organizados cronologicamente com datas/anos.

---

## Como Funciona (Padrao Existente)

O sistema ja possui atividades especiais que sao ativadas automaticamente pelo titulo exato da atividade. Exemplos existentes:
- **"Arvore da Gratidao"** -> Renderiza o componente FamilyTreeActivity
- **"Lista de Gratidao"** -> Renderiza formulario especifico de gratidao
- **"Afirmacao de Potencial"** -> Renderiza a Roleta de Palavras
- **"Manifesto"** -> Renderiza formulario com compartilhamento no mural

A nova atividade "Linha da Vida" seguira este mesmo padrao.

---

## Componente Visual: TimelineActivity

A interface sera inspirada na imagem de referencia fornecida, com:

### Visualizacao da Linha do Tempo
- Linha horizontal dourada conectando circulos coloridos
- Cada momento representado por um circulo com cor distinta
- Ano/data exibido acima de cada circulo
- Titulo e descricao abaixo de cada circulo
- Layout responsivo (horizontal em desktop, vertical em mobile)

### Formulario de Entrada
- Minimo de 5 momentos (ja iniciados vazios)
- Botao para adicionar mais momentos
- Cada momento possui: Ano (obrigatorio), Titulo (obrigatorio), Descricao (opcional)
- Botao para remover momentos extras (alem dos 5 obrigatorios)
- Ordenacao automatica por ano ao visualizar

### Fluxo do Usuario
1. Aluno ve a orientacao da atividade
2. Preenche os momentos nos campos do formulario
3. A visualizacao da timeline atualiza em tempo real
4. Quando tiver pelo menos 5 momentos completos, o botao de enviar e habilitado
5. Ao enviar, os dados sao formatados e salvos como submissao

---

## Estrutura da Interface

```text
+--------------------------------------------------+
| LINHA DA VIDA                                     |
+--------------------------------------------------+
| ORIENTACAO                                        |
| Indique pelo menos cinco momentos positivos...    |
+--------------------------------------------------+
|                                                   |
| VISUALIZACAO DA LINHA DO TEMPO                    |
|                                                   |
|  1998      2005      2012      2018      2023     |
|   O---------O---------O---------O---------O       |
|  Nasc.   Formou   Casou    Filha    Promo.        |
|  Desc..  Desc..   Desc..   Desc..   Desc..        |
|                                                   |
+--------------------------------------------------+
| SEUS MOMENTOS                                     |
|                                                   |
| [1] Ano: [____] Titulo: [____________]            |
|     Descricao: [_________________________]        |
|                                                   |
| [2] Ano: [____] Titulo: [____________]            |
|     Descricao: [_________________________]        |
|                                                   |
| ... (5 a N momentos)                              |
|                                                   |
| [+ Adicionar Momento]                             |
|                                                   |
| 5/5 momentos preenchidos                          |
| [======= Enviar Atividade =======]                |
+--------------------------------------------------+
```

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/TimelineActivity.tsx`

Componente principal com:
- Props: `description`, `onSubmit`, `isSubmitting`, `fontSizeClass` (mesmo padrao do FamilyTreeActivity)
- Estado interno para lista de momentos: `{ year: string, title: string, description: string }[]`
- Visualizacao horizontal/vertical responsiva da timeline
- Formulario de entrada para cada momento
- Validacao (minimo 5 momentos com ano e titulo preenchidos)
- Formatacao do conteudo para submissao (markdown)
- Cores: paleta de cores variadas para cada circulo (similar a imagem de referencia)

### 2. Modificar `src/pages/ActivityPage.tsx`

- Adicionar import do `TimelineActivity`
- Adicionar funcao de deteccao: `isTimelineActivity = (title) => title.toLowerCase().includes('linha da vida')`
- Adicionar bloco de renderizacao condicional (igual ao padrao da FamilyTreeActivity)
- Adicionar exclusao no bloco de orientacao generica (para evitar duplicidade)
- Adicionar exclusao no footer de submit (o componente tera seu proprio botao)

### 3. Migracao SQL - Criar a atividade no banco

Inserir o registro da atividade na tabela `activities` vinculada a Estacao 1 da Jornada 2:
- station_id: `584db9f1-1d6e-4109-ae4a-4b14a92a88c3` (Estacao 1 - Construindo a consciencia de si)
- title: "Linha da Vida"
- type: "essay" (seguindo o padrao das atividades especiais baseadas em titulo)
- description: Orientacao completa da atividade
- points: 10

### 4. Modificar `src/components/admin/ActivityForm.tsx`

Adicionar dica no formulario de admin sobre o titulo "Linha da Vida" (similar a dica existente da "Arvore da Gratidao").

---

## Detalhes Tecnicos

### Cores dos Circulos da Timeline
Paleta alternada para cada momento, inspirada na imagem de referencia:
- Dourado (#C9A84C)
- Rosa (#C94C6E)
- Azul (#4C7BC9)
- Roxo (#9B59B6)
- Verde (#27AE60)
- Laranja (#E67E22)
- Vermelho (#E74C3C)
- Turquesa (#1ABC9C)

### Responsividade
- Desktop: Timeline horizontal com scroll se necessario
- Mobile: Timeline vertical (circulos empilhados com linha vertical)

### Formato de Submissao
O conteudo sera formatado em markdown:
```
### Linha da Vida

**1998 - Nascimento**
Momento especial que marcou o inicio da minha jornada.

**2005 - Formatura**
Concluir o ensino fundamental foi um marco importante.

...
```

### Deteccao no ActivityPage
```typescript
const isTimelineActivity = (title: string) =>
  title.toLowerCase().includes('linha da vida');
```

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/TimelineActivity.tsx` | Criar | Componente interativo da Linha da Vida |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar o componente TimelineActivity |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica sobre titulo "Linha da Vida" |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 1 da Jornada 2 |

---

## Resultado Esperado

- Ao acessar a Estacao 1 da Jornada 2, o aluno vera a atividade "Linha da Vida"
- A interface exibira uma timeline visual interativa com circulos coloridos conectados por uma linha
- O aluno preenchera pelo menos 5 momentos com ano, titulo e descricao
- A timeline se atualiza visualmente em tempo real conforme o aluno preenche
- Ao enviar, os dados sao salvos como submissao da atividade
- Administradores podem ver o conteudo formatado na pagina de avaliacoes
