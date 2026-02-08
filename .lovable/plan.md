

# Plano: Atividade "Mentalizacao Guiada" - Estacao 6, Jornada 4

## Objetivo

Criar a atividade "Mentalizacao Guiada" para a Estacao 6 ("Infidelidade e divorcio") da Jornada 4. As participantes ouvem um audio com a mentalizacao guiada e, em seguida, escrevem uma reflexao. O audio sera enviado posteriormente pelo admin atraves do painel de gerenciamento.

---

## Como Funciona

1. A participante acessa a atividade e ve a orientacao
2. Se houver um audio disponivel (enviado pelo admin), um player de audio e exibido para que ela ouca a mentalizacao guiada
3. Apos ouvir, a participante preenche uma caixa de texto com sua reflexao
4. Envia a atividade

A atividade usa o fluxo padrao de `essay`, com a adicao de um player de audio vinculado diretamente a atividade (diferente do audio da estacao).

---

## Alteracoes Necessarias

### 1. Migracao SQL - Adicionar coluna e criar bucket

- Adicionar coluna `audio_url` (TEXT, nullable) na tabela `activities`
- Criar bucket de storage `activity-audios` (publico) para armazenar os audios das atividades
- Inserir a atividade "Mentalizacao Guiada" na Estacao 6

Dados da atividade:
- **station_id:** `61cecb89-c9e3-4668-8bae-337283ef15d9` (Estacao 6 - Infidelidade e divorcio)
- **title:** "Mentalização Guiada"
- **type:** `essay`
- **description:** Orientacao formatada em HTML explicando que as participantes irao ouvir um audio e depois escrever uma reflexao
- **points:** 10
- **audio_url:** NULL (sera preenchido pelo admin posteriormente)

### 2. Modificar `src/types/index.ts`

- Adicionar `audio_url?: string` na interface `Activity`

### 3. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar estado para `audioUrl` e `uploadingAudio`
- Adicionar funcao de upload de audio para o bucket `activity-audios` (seguindo o mesmo padrao do `StationForm.tsx`)
- Adicionar campo de upload de audio no formulario (com player de preview e botao de remover)
- Incluir `audio_url` nos dados enviados no `onSubmit`

### 4. Modificar `src/pages/ActivityPage.tsx`

- Na secao de orientacao generica do essay (onde renderiza `dangerouslySetInnerHTML` ou `parsedDescription`), adicionar um bloco de player de audio logo abaixo da orientacao, quando `activity.audio_url` estiver preenchido
- O player sera um elemento `<audio>` nativo com controles, estilizado com a paleta do projeto
- Exibir uma mensagem informativa caso o audio ainda nao tenha sido enviado pelo admin (opcional - ou simplesmente nao mostrar o player)

### 5. Modificar `src/components/admin/ActivityManager.tsx`

- Exibir um icone de audio (Music) ao lado de atividades que possuem `audio_url` preenchido, para o admin visualizar rapidamente quais atividades tem audio

---

## Detalhes Tecnicos

### Upload de Audio no ActivityForm

Seguindo o padrao existente no `StationForm.tsx`:

```
Bucket: activity-audios
Path: {stationId}/{audio-timestamp.ext}
Tipos aceitos: audio/mp3, audio/mpeg, audio/wav, audio/ogg, audio/webm, audio/mp4
```

O campo aparecera abaixo do campo de Descricao no formulario, com:
- Input file para selecionar o audio
- Player de preview quando um audio esta carregado
- Botao para remover o audio
- Indicador de upload em progresso

### Player de Audio na ActivityPage

Sera um bloco entre a orientacao e a caixa de texto:

```text
+----------------------------------------------------------+
|  [icone headphones] Audio da Mentalizacao                 |
|  [========= PLAYER DE AUDIO NATIVO =========]             |
|  "Ouca o audio acima antes de escrever sua reflexao"      |
+----------------------------------------------------------+
```

Estilos: fundo suave `bg-primary/5`, borda `border-primary/20`, arredondado

### Formato de Dados

O `onSubmit` do `ActivityForm` passara `audio_url` como parte dos dados da atividade. Os tipos `Omit<Activity, 'id' | 'created_at'>` ja incluirao `audio_url` apos a atualizacao da interface.

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Adicionar coluna `audio_url`, criar bucket, inserir atividade |
| `src/types/index.ts` | Modificar | Adicionar `audio_url` na interface Activity |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar upload de audio no formulario |
| `src/components/admin/ActivityManager.tsx` | Modificar | Exibir icone de audio nas atividades |
| `src/pages/ActivityPage.tsx` | Modificar | Exibir player de audio antes da caixa de texto |

---

## Resultado Esperado

- Ao acessar a Estacao 6 da Jornada 4, a aluna vera a atividade "Mentalizacao Guiada"
- A orientacao sera exibida explicando o processo
- Se o admin ja tiver enviado o audio, um player sera exibido para a aluna ouvir
- Abaixo do player, a caixa de texto permitira escrever a reflexao
- O admin podera fazer upload do audio diretamente no formulario de edicao da atividade (Gerenciar -> Editar Estacao -> Editar Atividade)
- A atividade vale 10 pontos
- O recurso de upload de audio estara disponivel para qualquer atividade do tipo essay, nao apenas esta

