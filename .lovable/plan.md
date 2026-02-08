
# Plano: Atividade "Farol da Minha Vida" - Estacao Integracao, Jornada 6

## Objetivo

Criar a atividade de integracao "Farol da Minha Vida" para a Estacao de Integracao da Jornada 6 ("Saude da Mulher"). A participante reflete sobre sua vida nas dimensoes fisica, mental e espiritual usando a metafora do semaforo, registrando o que precisa parar (vermelho), o que exige atencao (amarelo) e o que deve continuar fortalecendo (verde).

---

## Diferenca em relacao ao "Farol dos Relacionamentos"

Ja existe uma atividade chamada "Farol das Acoes nos Relacionamentos" (TrafficLightActivity), que permite registrar **multiplos relacionamentos** (minimo 3), cada um com nome, palavra-chave e tres cores. Esta nova atividade e diferente:

- **Farol dos Relacionamentos**: Multiplos relacionamentos, cada um com nome + palavra-chave + vermelho/amarelo/verde
- **Farol da Minha Vida**: Uma unica reflexao pessoal com apenas 3 campos de texto (vermelho, amarelo, verde), focada na vida como um todo

Como os formatos sao diferentes, sera criado um componente dedicado. O detector existente (`isTrafficLightActivity`) que usa `includes('farol')` sera ajustado para nao capturar "Farol da Minha Vida".

---

## Alteracoes Necessarias

### 1. Novo Componente: `LifeTrafficLightActivity.tsx`

Criar `src/components/activities/LifeTrafficLightActivity.tsx` contendo:

- **LifeTrafficLightActivity** - Componente de preenchimento:
  - Exibe a orientacao formatada em HTML (as instrucoes sobre as tres luzes e o convite a reflexao)
  - Tres campos de texto grandes (Textarea), cada um acompanhado de um indicador visual colorido:
    - Vermelho: "Pare e Reavalie" - comportamentos a interromper
    - Amarelo: "Atencao e Ajuste" - o que precisa de cuidado e equilibrio
    - Verde: "Siga Fortalecendo" - praticas e atitudes a manter
  - Botao de envio habilitado apenas quando os 3 campos estiverem preenchidos
  - Layout visual com circulos coloridos e sombra brilhante, seguindo o estilo visual do semaforo ja existente

- **SubmittedLifeTrafficLightView** - Componente de visualizacao pos-envio:
  - Exibe um unico semaforo central com as tres luzes
  - Cada luz e clicavel e abre um dialog com a reflexao correspondente
  - Reutiliza o mesmo estilo visual do SubmittedTrafficLightView (pole com luzes brilhantes)

### 2. Atualizar detectores no `ActivityPage.tsx`

- Adicionar funcao detectora `isLifeTrafficLight` que verifica se o titulo contem "farol da minha vida"
- **Atualizar** `isTrafficLightActivity` para excluir "farol da minha vida":
  ```
  const isTrafficLightActivity = (title: string) => 
    title.toLowerCase().includes('farol') && !title.toLowerCase().includes('farol da minha vida');
  ```
- Adicionar bloco "Already Submitted" com SubmittedLifeTrafficLightView
- Adicionar bloco de renderizacao do componente na secao essay
- Excluir das renderizacoes genericas (submitted, orientation, essay textarea, footer)

### 3. Atualizar detectores no `SubmissionView.tsx`

- Importar SubmittedLifeTrafficLightView
- Adicionar `isLifeTrafficLight` detector
- Adicionar renderizacao condicional (antes do isTrafficLight generico)
- **Atualizar** `isTrafficLightActivity` no SubmissionView tambem

### 4. Migracao SQL

- **station_id:** `8d116768-25f2-474d-a072-6f490a2e0f1d` (Farol da Minha Vida - Estacao Integracao)
- **title:** "Farol da Minha Vida"
- **type:** `essay`
- **points:** 10
- **description:** Orientacao formatada em HTML com o convite a reflexao, as tres luzes (vermelha, amarela, verde) e as instrucoes de registro

---

## Formato de Armazenamento

O conteudo sera salvo em formato Markdown estruturado para facil parsing:

```
### Farol da Minha Vida

---

- Vermelho (Parar): [texto da participante]
- Amarelo (Atencao): [texto da participante]
- Verde (Seguir): [texto da participante]
```

### 5. Formato de Visualizacao pos-envio

A visualizacao exibira um unico semaforo central (nao multiplos como no Farol dos Relacionamentos). Ao clicar em cada luz, um dialog mostra a reflexao completa da participante para aquela cor.

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/LifeTrafficLightActivity.tsx` | Criar | Componente de reflexao pessoal (3 textareas) + visualizacao com semaforo |
| `src/pages/ActivityPage.tsx` | Editar | Detector + renderizacao + ajuste no detector existente |
| `src/pages/SubmissionView.tsx` | Editar | Detector + renderizacao + ajuste no detector existente |
| Nova migracao SQL | Criar | Inserir atividade essay na Estacao Integracao da Jornada 6 |

---

## Resultado Esperado

- Ao acessar a Estacao "Farol da Minha Vida" da Jornada 6, a aluna vera a atividade com orientacao detalhada
- Tres campos de texto grandes com indicadores coloridos (vermelho, amarelo, verde)
- O envio so sera possivel com os 3 campos preenchidos
- Apos o envio, um semaforo visual centralizado mostrara as reflexoes ao clicar nas luzes
- Professores e admins poderao ver as submissoes formatadas
- A atividade existente "Farol dos Relacionamentos" continuara funcionando normalmente
- A atividade vale 10 pontos
