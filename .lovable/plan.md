

# Configuracoes e Melhorias na Tela de Avaliacoes

## Objetivo
1. Criar uma nova pagina de **Configuracoes** com opcao para exibir/ocultar Nota e Feedback
2. Atualizar a tela de **Avaliacoes** para mostrar:
   - Nome do participante
   - Nome da Jornada
   - Nome da Estacao

## Visao Geral da Solucao

### 1. Pagina de Configuracoes
Uma nova pagina acessivel pelo menu do usuario (dropdown) onde administradores/professores poderao:
- Ativar/desativar exibicao de **Nota** para participantes
- Ativar/desativar exibicao de **Feedback** para participantes

### 2. Melhoria na Tela de Avaliacoes
Adicionar informacoes contextuais em cada submissao:
- **Nome do Participante** (buscado da tabela `profiles`)
- **Nome da Jornada** (atraves da relacao Activity -> Station -> Journey)
- **Nome da Estacao** (atraves da relacao Activity -> Station)

## Arquivos a Criar

### `src/pages/Settings.tsx`
Nova pagina de configuracoes com:
- Card para "Configuracoes de Avaliacao"
- Switch para "Exibir Nota para Participantes"
- Switch para "Exibir Feedback para Participantes"
- Salvar no localStorage (key: `evaluation-settings`)

### `src/contexts/SettingsContext.tsx`
Novo contexto para gerenciar configuracoes globais:
- Estado `showScoreToStudents` (boolean)
- Estado `showFeedbackToStudents` (boolean)
- Persistencia no localStorage
- Funcoes para atualizar configuracoes

## Arquivos a Modificar

### `src/App.tsx`
- Adicionar rota `/configuracoes` para a nova pagina Settings
- Envolver app com `SettingsProvider`

### `src/components/layout/AppLayout.tsx`
- Atualizar o link de "Configuracoes" no dropdown do usuario para navegar para `/configuracoes`
- Adicionar item de navegacao "Configuracoes" para admin/professor

### `src/pages/Evaluations.tsx`
- Buscar dados de perfis (profiles) para obter nomes dos participantes
- Mapear submissoes para incluir informacoes de Jornada e Estacao
- Atualizar UI para exibir:
  - Nome do participante
  - Jornada > Estacao (breadcrumb)
  - Data de submissao

### `src/pages/ActivityPage.tsx`
- Consumir `SettingsContext`
- Condicionar exibicao de nota/feedback baseado nas configuracoes

## Fluxo de Dados

```text
                    Configuracoes
                         │
                         ▼
    ┌─────────────────────────────────────┐
    │     SettingsContext (localStorage)   │
    │  - showScoreToStudents: boolean      │
    │  - showFeedbackToStudents: boolean   │
    └─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   ActivityPage            Evaluations
   (participante)          (corretor)
   - Ve nota/feedback      - Sempre ve tudo
     se habilitado         - Pode lancar nota/feedback
```

## Interface da Pagina de Configuracoes

```text
┌─────────────────────────────────────────────────────┐
│                  Configuracoes                       │
│       Gerencie as configuracoes do sistema          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  Configuracoes de Avaliacao                   │  │
│  ├───────────────────────────────────────────────┤  │
│  │                                               │  │
│  │  Exibir Nota para Participantes      [━━━○]  │  │
│  │  Quando ativado, os participantes              │
│  │  poderao ver suas notas                       │  │
│  │                                               │  │
│  │  ─────────────────────────────────────────    │  │
│  │                                               │  │
│  │  Exibir Feedback para Participantes  [━━━○]  │  │
│  │  Quando ativado, os participantes              │
│  │  poderao ver o feedback do corretor           │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Interface Atualizada de Avaliacoes

```text
┌─────────────────────────────────────────────────────────┐
│  ⏱ Pendentes (8)                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Maria Silva                                        │ │
│  │  Jornada 1 > Estacao de Boas-vindas                │ │
│  │  Afirmacao de Potencial                 [Avaliar]  │ │
│  │  12/01/2026                                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Ana Oliveira                                       │ │
│  │  Jornada 2 > Reflexoes                             │ │
│  │  Mapa do Eu Feminino                    [Avaliar]  │ │
│  │  12/01/2026                                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Detalhes Tecnicos

### SettingsContext

```typescript
interface SettingsContextType {
  showScoreToStudents: boolean;
  showFeedbackToStudents: boolean;
  updateSettings: (settings: Partial<EvaluationSettings>) => void;
}

// Persistencia em localStorage
const SETTINGS_KEY = 'evaluation-settings';
```

### Busca de Perfis em Evaluations

```typescript
// Buscar perfis para obter nomes dos participantes
const [profiles, setProfiles] = useState<Record<string, string>>({});

useEffect(() => {
  const fetchProfiles = async () => {
    const userIds = [...new Set(submissions.map(s => s.user_id))];
    const { data } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);
    
    if (data) {
      const profileMap = data.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);
      setProfiles(profileMap);
    }
  };
  fetchProfiles();
}, [submissions]);
```

### Mapeamento de Jornada/Estacao

```typescript
// Para cada submissao, encontrar a hierarquia completa
const getSubmissionContext = (submission: ActivitySubmission) => {
  const activity = activities.find(a => a.id === submission.activity_id);
  const station = stations.find(s => s.id === activity?.station_id);
  const journey = journeys.find(j => j.id === station?.journey_id);
  
  return {
    participantName: profiles[submission.user_id] || 'Participante',
    journeyTitle: journey?.title || '',
    stationTitle: station?.title || '',
    activityTitle: activity?.title || '',
  };
};
```

### Condicional de Exibicao no ActivityPage

```typescript
const { showScoreToStudents, showFeedbackToStudents } = useSettings();

// Na area de exibicao de resultado
{showScoreToStudents && existingSubmission.score !== undefined && (
  <p>Nota: {existingSubmission.score}%</p>
)}

{showFeedbackToStudents && existingSubmission.feedback && (
  <div className="p-4 bg-accent/10 rounded-lg">
    <p>Feedback da Mentora:</p>
    <p>{existingSubmission.feedback}</p>
  </div>
)}
```

## Resumo das Alteracoes

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/contexts/SettingsContext.tsx` | Criar | Contexto para configuracoes globais |
| `src/pages/Settings.tsx` | Criar | Pagina de configuracoes |
| `src/App.tsx` | Modificar | Adicionar rota e provider |
| `src/components/layout/AppLayout.tsx` | Modificar | Atualizar navegacao |
| `src/pages/Evaluations.tsx` | Modificar | Adicionar info de participante/jornada/estacao |
| `src/pages/ActivityPage.tsx` | Modificar | Aplicar configuracoes de visibilidade |

## Beneficios

- Controle granular sobre o que os participantes podem ver
- Visao completa do contexto de cada submissao para os corretores
- Configuracoes persistidas entre sessoes
- Interface administrativa clara e intuitiva

