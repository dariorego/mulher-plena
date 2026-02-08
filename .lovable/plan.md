
# Plano: Recurso "Experiencia Sensivel" em Atividades

## Objetivo

Criar um sistema que permita marcar atividades individuais como "experiencia sensivel", com:
1. Um toggle no formulario de criacao/edicao de atividades (painel admin)
2. Um aviso visual na pagina da atividade (para participantes)
3. Um pop-up com mensagem explicativa ao clicar no aviso
4. A mensagem do pop-up configuravel na pagina de Configuracoes

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Migracao SQL | Criar | Adicionar coluna `is_sensitive` na tabela `activities` |
| `src/types/index.ts` | Editar | Adicionar campo `is_sensitive` na interface `Activity` |
| `src/integrations/supabase/types.ts` | Editar | Atualizar tipos gerados |
| `src/components/admin/ActivityForm.tsx` | Editar | Adicionar checkbox para marcar atividade como sensivel |
| `src/components/admin/ActivityManager.tsx` | Editar | Exibir indicador visual na lista quando atividade e sensivel |
| `src/contexts/SettingsContext.tsx` | Editar | Adicionar campo `sensitiveContentMessage` nas configuracoes |
| `src/pages/Settings.tsx` | Editar | Adicionar card para editar a mensagem de experiencia sensivel |
| `src/pages/ActivityPage.tsx` | Editar | Exibir alerta clicavel quando atividade e sensivel |

---

## Detalhes Tecnicos

### 1. Migracao SQL

Adicionar uma coluna booleana `is_sensitive` com valor padrao `false`:

```sql
ALTER TABLE public.activities ADD COLUMN is_sensitive boolean NOT NULL DEFAULT false;
```

### 2. Tipo `Activity` (`src/types/index.ts`)

Adicionar o campo opcional `is_sensitive?: boolean` na interface Activity.

### 3. Formulario de Atividades (`ActivityForm.tsx`)

Adicionar um checkbox com o componente Switch existente, posicionado entre o campo de pontos e os botoes de acao:
- Label: "Experiencia Sensivel"
- Descricao: "Marque se esta atividade aborda temas que exigem cuidado emocional"
- Icone: `AlertTriangle` (lucide)
- O valor sera enviado junto com os demais dados da atividade

### 4. Lista de Atividades (`ActivityManager.tsx`)

Na listagem de atividades da estacao, exibir um pequeno indicador (icone `AlertTriangle` em amarelo) ao lado do tipo/pontos quando `is_sensitive` for `true`.

### 5. Configuracoes - Mensagem do Pop-up

**SettingsContext**: Adicionar campo `sensitiveContentMessage` com um texto padrao:

> "Esta atividade aborda temas que podem despertar emocoes intensas. Sinta-se a vontade para fazer pausas, cuidar de si e buscar apoio se necessario. Voce esta em um espaco seguro."

**Pagina Settings**: Adicionar um novo card "Experiencia Sensivel" com:
- Icone `AlertTriangle`
- Um campo Textarea para editar a mensagem
- Salvamento automatico ao sair do campo (onBlur), mesmo padrao dos outros campos

### 6. Pagina da Atividade (`ActivityPage.tsx`)

Quando `activity.is_sensitive` for `true`, exibir um banner de alerta logo abaixo do header da atividade:
- Fundo amarelo suave (`bg-amber-50`)
- Icone `AlertTriangle` + texto "Experiencia Sensivel"
- Ao clicar, abre um Dialog (pop-up) com a mensagem configurada nas Settings
- O Dialog tera um botao "Entendi" para fechar

---

## Resultado Esperado

- Administradores podem marcar qualquer atividade como "sensivel" ao criar ou editar
- Na lista de atividades (admin), um icone amarelo indica atividades sensiveis
- Na pagina da atividade, participantes veem um banner clicavel de aviso
- Ao clicar no aviso, um pop-up exibe a mensagem configurada em Configuracoes
- A mensagem do pop-up pode ser personalizada pelo administrador a qualquer momento
