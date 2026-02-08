
# Plano: Atividade "Caixa da Alegria" (Forum com Imagem) - Estacao 3, Jornada 6

## Objetivo

Criar a atividade compartilhada "Caixa da Alegria" para a Estacao 3 ("Como manter a alegria e o entusiasmo") da Jornada 6. As participantes constroem uma "caixa da alegria" (fisica ou digital), registram sua experiencia e anexam uma foto da caixa no mural coletivo.

---

## Como Funciona

Esta e uma atividade do tipo `forum` (mural interativo estilo Padlet) com uma novidade: **suporte a upload de imagens**. Alem de texto e audio, as participantes poderao anexar uma foto ao seu post no mural.

- A participante ve a orientacao sobre como criar a Caixa da Alegria
- Escreve sua reflexao sobre a experiencia
- Anexa uma foto da sua caixa (obrigatorio para esta atividade)
- O post com texto + imagem e compartilhado no mural coletivo
- Todas as participantes visualizam as caixas umas das outras em tempo real

---

## Alteracoes Necessarias

### 1. Migracao SQL

Uma unica migracao que:

- Adiciona a coluna `image_url` (TEXT, nullable) na tabela `forum_posts` para suportar imagens nos posts
- Cria o bucket de storage `forum-images` (publico) para armazenar as fotos enviadas
- Configura politicas RLS no bucket: upload para usuarios autenticados, leitura publica
- Insere a atividade "Caixa da Alegria" na Estacao 3 da Jornada 6 com tipo `forum` e 10 pontos

### 2. Atualizar tipo ForumPost (`src/types/index.ts`)

- Adicionar campo opcional `image_url?: string` na interface ForumPost

### 3. Atualizar ForumBoard (`src/components/activities/ForumBoard.tsx`)

Adicionar suporte opcional a upload de imagens:

- Novas props: `allowImages?: boolean` e `requireImage?: boolean`
- Quando `allowImages` estiver ativo:
  - Botao para selecionar imagem (com preview antes do envio)
  - Funcao de upload para o bucket `forum-images`
  - Exibicao da imagem nos cartoes do mural (clicavel para ampliar)
- Quando `requireImage` estiver ativo:
  - O botao "Compartilhar" so e habilitado se uma imagem estiver selecionada
- Layout: a secao de imagem aparece entre o textarea e a secao de audio

### 4. Registrar no ActivityPage (`src/pages/ActivityPage.tsx`)

- Adicionar funcao detectora `isJoyBox` (verifica se o titulo contem "caixa da alegria")
- Passar as props `allowImages={true}` e `requireImage={true}` no ForumBoard quando a atividade for "Caixa da Alegria"
- Aplicar em ambas as instancias do ForumBoard (visao aluno e visao admin)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL | Criar | Coluna image_url, bucket forum-images, atividade forum |
| `src/types/index.ts` | Editar | Adicionar image_url ao ForumPost |
| `src/components/activities/ForumBoard.tsx` | Editar | Suporte a upload e exibicao de imagens |
| `src/pages/ActivityPage.tsx` | Editar | Detectar "Caixa da Alegria" e passar props de imagem |

---

## Detalhes Tecnicos

- **Storage**: Bucket `forum-images` publico, com arquivos organizados por `{user_id}/{timestamp}.{ext}`
- **Tipos de arquivo aceitos**: imagens (image/jpeg, image/png, image/webp, image/gif)
- **Limite de tamanho**: 10MB por imagem
- **Visualizacao**: Imagens exibidas nos cartoes do mural com proporcao preservada, clicaveis para ampliar em modal
- **Compatibilidade**: O ForumBoard continua funcionando normalmente para todas as demais atividades forum (sem imagens), pois as props sao opcionais

---

## Resultado Esperado

- Ao acessar a Estacao 3 da Jornada 6, a aluna vera a atividade "Caixa da Alegria"
- A orientacao sera exibida explicando como criar a caixa e registrar a experiencia
- O mural interativo permitira compartilhar textos, audios e fotos
- A foto sera obrigatoria para o envio nesta atividade especifica
- As demais atividades forum continuarao funcionando normalmente (sem imagens)
- Todas as participantes poderao ver as fotos das caixas umas das outras
- A atividade vale 10 pontos
