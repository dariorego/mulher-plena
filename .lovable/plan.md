
## Padronizacao Tipografica - Jornada 4 e toda a aplicacao

### Problema Identificado
Existem dois sistemas de tamanho de fonte inconsistentes na aplicacao:

1. **Classe `text-adjustable`** (usada em JourneyDetail): utiliza variaveis CSS com valores muito pequenos (8px, 12px, 14px, 16px, 20px)
2. **Classes `.text-size-*`** (usadas em StationDetail e ActivityPage): utiliza valores maiores e mais adequados (0.875rem, 1rem, 1.25rem, 1.5rem, 1.75rem)

No nivel "Medio", o texto da Jornada aparece com 12px enquanto o texto da Estacao aparece com 16px -- uma diferenca muito perceptivel.

### Solucao

Unificar tudo para usar um unico sistema, alinhando os valores das variaveis CSS com os valores das classes utilitarias.

### Alteracoes

**1. `src/contexts/FontSizeContext.tsx`**
- Atualizar os valores de `fontSizeValues` para corresponder as classes utilitarias:
  - sm: 0.875rem / 1.5
  - md: 1rem / 1.6
  - lg: 1.25rem / 1.7
  - xl: 1.5rem / 1.75
  - 2xl: 1.75rem / 1.8

**2. `src/pages/JourneyDetail.tsx`**
- Substituir `text-adjustable` por `fontSizeClass` na descricao da jornada (para consistencia com StationDetail e ActivityPage)

**3. `src/index.css`**
- Atualizar os valores da classe `.text-adjustable` para usar `rem` em vez de `px` nos defaults, mantendo alinhamento com o contexto

### Detalhes Tecnicos

As variaveis CSS `--app-font-size` e `--app-line-height` serao atualizadas com valores em `rem` para respeitar as preferencias do navegador do usuario. A classe `text-adjustable` e as classes `.text-size-*` passarao a ter os mesmos valores efetivos, eliminando a inconsistencia visual entre as paginas.

Nenhuma migracao de banco e necessaria. A mudanca e puramente frontend.
