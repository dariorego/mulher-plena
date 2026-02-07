

# Plano: Atividade "Mapa de Vida Equilibrada" - Estacao de Integracao, Jornada 2

## Objetivo
Criar a atividade final da Jornada 2 - "Mapa de Vida Equilibrada" - para a Estacao de Integracao. A participante cria um painel mapeando as principais areas da sua vida, definindo sonhos/projetos e metas para cada area, cultivando equilibrio e bem-estar.

---

## Como Funciona

A participante preenche uma tabela interativa com areas da vida, onde para cada area define:
1. **Area da Vida** - A area que deseja mapear (ex: Convivencia Familiar, Vida Profissional, Saude, Espiritualidade, etc.)
2. **Sonhos e Projetos** - O que deseja alcancar nessa area
3. **Metas** - Metas concretas e possiveis para cultivar equilibrio nessa area

Alem da tabela, a atividade exibe uma "Sugestao de Pratica Doutrinaria" ao final com instrucoes para a pratica dos 7 dias de autoafirmacao.

Minimo de 3 areas preenchidas para enviar.

---

## Estrutura da Interface

```text
+----------------------------------------------------------+
| MAPA DE VIDA EQUILIBRADA                                  |
+----------------------------------------------------------+
| ORIENTACAO                                                |
| Em suas reflexoes durante essa jornada, crie um painel    |
| que representa as principais areas da sua vida e trace    |
| metas possiveis e significativas para cultivar equilibrio |
| e bem-estar em seu dia a dia.                             |
+----------------------------------------------------------+
|                                                           |
| +---------------+------------------+--------------------+ |
| | AREA DA VIDA  | SONHOS/PROJETOS  | METAS              | |
| +---------------+------------------+--------------------+ |
| | [___________] | [______________] | [________________] | |
| +---------------+------------------+--------------------+ |
| | [___________] | [______________] | [________________] | |
| +---------------+------------------+--------------------+ |
| | [___________] | [______________] | [________________] | |
| +---------------+------------------+--------------------+ |
|                                                           |
| [+ Adicionar Area]                                        |
|                                                           |
| 3/3 areas preenchidas                                     |
|                                                           |
| +-------------------------------------------------------+|
| | SUGESTAO DE PRATICA DOUTRINARIA                        ||
| | Durante 7 dias, escreva diariamente 5 frases de       ||
| | autoafirmacao para si mesma...                          ||
| +-------------------------------------------------------+|
|                                                           |
| [======= Enviar Atividade =======]                        |
+----------------------------------------------------------+
```

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/BalancedLifeMapActivity.tsx`

Componente principal do formulario, seguindo o mesmo padrao do RoleDiaryActivity:
- Props: `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- Estado interno: lista de entradas `{ area: string, dreams: string, goals: string }[]`
- Comeca com 4 linhas vazias (areas de vida sugeridas como placeholder)
- Tabela responsiva: desktop como tabela, mobile como cartoes empilhados
- Botao para adicionar/remover entradas
- Minimo de 3 entradas completas para habilitar envio
- Bloco de "Sugestao de Pratica Doutrinaria" fixo ao final, antes do botao de envio
- Formatacao em markdown para armazenamento

### 2. Criar `src/components/activities/SubmittedBalancedLifeMapView.tsx`

Componente para exibir a submissao formatada:
- Parser de markdown para extrair dados das areas de vida
- Exibicao como tabela estilizada
- Dialog popup ao clicar em uma linha para ver detalhes completos
- Exibicao da sugestao de pratica doutrinaria ao final

### 3. Modificar `src/pages/ActivityPage.tsx`

- Adicionar imports de `BalancedLifeMapActivity` e `SubmittedBalancedLifeMapView`
- Adicionar funcao de deteccao: `isBalancedLifeMap = (title) => title.toLowerCase().includes('mapa de vida equilibrada')`
- Adicionar bloco de renderizacao para submissao existente (Already Submitted) com SubmittedBalancedLifeMapView
- Adicionar bloco de renderizacao do componente no formulario de preenchimento
- Excluir da orientacao generica e do footer de submit (mesmo padrao das demais atividades especiais)

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedBalancedLifeMapView`
- Adicionar deteccao e renderizacao formatada no modal de avaliacao

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedBalancedLifeMapView`
- Adicionar deteccao e renderizacao formatada na pagina

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Mapa de Vida Equilibrada" na lista de titulos especiais na dica do formulario de admin

### 7. Migracao SQL - Inserir atividade no banco

- station_id: `51fd9a50-6bf9-40ed-b295-83fbdc898f2a` (Estacao de Integracao - Jornada 2)
- title: "Mapa de Vida Equilibrada"
- type: `essay`
- description: texto de orientacao com HTML
- points: 10

---

## Detalhes Tecnicos

### Formato de Submissao (Markdown)

```
### Mapa de Vida Equilibrada

---

**Area:** Convivencia Familiar
**Sonhos e Projetos:** Ter momentos de qualidade com minha familia todos os dias
**Metas:** Reservar pelo menos 1 hora por dia para atividades em familia; organizar um jantar semanal

---

**Area:** Vida Profissional
**Sonhos e Projetos:** Alcancar uma posicao de lideranca
**Metas:** Fazer um curso de gestao; buscar mentoria na empresa

---

**Area:** Saude e Bem-estar
**Sonhos e Projetos:** Ter uma rotina saudavel e equilibrada
**Metas:** Praticar exercicios 3x por semana; meditar diariamente por 10 minutos
```

### Deteccao no ActivityPage

```typescript
const isBalancedLifeMap = (title: string) =>
  title.toLowerCase().includes('mapa de vida equilibrada');
```

### Sugestao de Pratica Doutrinaria

Bloco fixo renderizado abaixo da tabela e acima do botao de envio, com destaque visual (fundo diferenciado, icone). O texto completo:

"SUGESTAO DE PRATICA DOUTRINARIA: Durante 7 dias, escreva diariamente 5 frases de autoafirmacao para si mesma. Utilize seu caderno de estudos ou bloco de anotacoes. As frases devem ser positivas, no tempo presente e refletir estados ou qualidades que voce deseja fortalecer. Escolha um momento tranquilo, leia cada frase em voz baixa ou mentalmente e permita-se sentir o significado de cada uma."

### Interface da Tabela

- Desktop: Tabela HTML estilizada com 3 colunas (Area da Vida, Sonhos e Projetos, Metas)
- Mobile: Cartoes empilhados com os 3 campos
- Cabecalho da tabela em cor primaria
- Linhas alternadas com fundo suave
- Placeholders sugestivos para cada area (Convivencia Familiar, Vida Profissional, Saude, Espiritualidade)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/BalancedLifeMapActivity.tsx` | Criar | Formulario interativo com tabela de areas de vida |
| `src/components/activities/SubmittedBalancedLifeMapView.tsx` | Criar | Visualizacao formatada como tabela |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar ambos componentes |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao de Integracao |

---

## Resultado Esperado

- Ao acessar a Estacao de Integracao da Jornada 2, a aluna vera a atividade "Mapa de Vida Equilibrada"
- A interface exibira uma tabela interativa com 3 colunas para preencher areas de vida
- Minimo de 3 areas completas para enviar
- A sugestao de pratica doutrinaria sera exibida abaixo da tabela como bloco informativo
- Apos o envio, a submissao sera exibida como tabela formatada
- Administradores e professores verao a mesma visualizacao nas paginas de avaliacao e submissao
