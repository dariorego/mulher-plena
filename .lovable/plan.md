

# Plano: Dependencia entre Jornadas (Desbloqueio Sequencial)

## Objetivo

Criar um mecanismo de desbloqueio progressivo de jornadas: as jornadas 1, 2 e 3 sao sempre acessiveis, mas a partir da jornada 4, cada jornada so pode ser acessada quando todas as anteriores tiverem 100% de progresso.

**Exemplo:** A jornada 4 so e liberada se jornadas 1, 2 e 3 estiverem com 100%. A jornada 5 so e liberada se 1, 2, 3 e 4 estiverem com 100%, e assim por diante.

**Importante:** Essa restricao se aplica apenas a participantes (role `aluno`). Administradores e professores continuam vendo todas as jornadas normalmente.

---

## Resumo das Alteracoes

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/contexts/DataContext.tsx` | Editar | Adicionar funcao `isJourneyUnlocked` que verifica se uma jornada esta liberada |
| `src/pages/Journeys.tsx` | Editar | Aplicar visual de bloqueio (cadeado, opacidade reduzida) e impedir clique em jornadas bloqueadas |
| `src/pages/Dashboard.tsx` | Editar | Aplicar o mesmo visual de bloqueio na secao "Suas Jornadas" |
| `src/pages/JourneyDetail.tsx` | Editar | Redirecionar o participante de volta caso acesse a URL de uma jornada bloqueada diretamente |

---

## Detalhes Tecnicos

### 1. Nova funcao `isJourneyUnlocked` no DataContext

Sera adicionada uma funcao ao DataContext que recebe o `userId` e o `journeyId` e retorna `true/false`:

**Logica:**
- Ordenar todas as jornadas por `order_index`
- Encontrar a posicao da jornada solicitada
- Se `order_index <= 3`, retornar `true` (sempre liberada)
- Se `order_index >= 4`, verificar se **todas** as jornadas com `order_index` menor possuem progresso = 100% usando `getJourneyProgress`

### 2. Pagina de Jornadas (`Journeys.tsx`)

Para participantes (`aluno`), cada card de jornada tera:
- **Jornada liberada:** Funciona como hoje (link clicavel, visual normal)
- **Jornada bloqueada:**
  - Opacidade reduzida (`opacity-50`)
  - Icone de cadeado no canto do card
  - Clique desabilitado (remove o `Link`)
  - Mensagem de tooltip ou texto indicando: "Complete as jornadas anteriores para desbloquear"
  - Barra de progresso nao aparece (ja que nao pode acessar)

### 3. Dashboard - Secao "Suas Jornadas"

O mesmo tratamento visual da pagina de Jornadas sera aplicado nos cards do Dashboard:
- Jornadas bloqueadas aparecem com opacidade reduzida e cadeado
- Clique desabilitado

### 4. Protecao via URL direta (`JourneyDetail.tsx`)

Se um participante tentar acessar `/jornadas/{id}` de uma jornada bloqueada diretamente pela barra de endereco:
- Redirecionar para `/jornadas` com um toast informativo: "Complete as jornadas anteriores para acessar esta jornada"

### 5. Sem alteracao no banco de dados

Nao e necessaria nenhuma migracao SQL. A logica de desbloqueio e calculada inteiramente no frontend, com base no progresso ja existente na tabela `user_progress`.

---

## Fluxo Visual para o Participante

```text
  Jornada 1 (100%)    Jornada 2 (100%)    Jornada 3 (75%)
  [  Liberada  ]      [  Liberada  ]      [  Liberada  ]

  Jornada 4            Jornada 5            Jornada 6
  [  Bloqueada ]      [  Bloqueada ]      [  Bloqueada ]
       🔒                  🔒                  🔒
  "Complete as         "Complete as         "Complete as
   anteriores"          anteriores"          anteriores"
```

No exemplo acima, a jornada 3 ainda esta em 75%, entao as jornadas 4-9 permanecem bloqueadas. Quando a jornada 3 chegar a 100%, a jornada 4 sera automaticamente desbloqueada.

---

## Resultado Esperado

- Jornadas 1, 2 e 3 estao sempre acessiveis para todos os participantes
- A partir da jornada 4, o acesso depende da conclusao de 100% de todas as jornadas anteriores
- Administradores e professores nao sao afetados pela restricao
- Visual claro de cadeado + opacidade para jornadas bloqueadas
- Protecao contra acesso direto por URL
- Nenhuma alteracao no banco de dados necessaria

