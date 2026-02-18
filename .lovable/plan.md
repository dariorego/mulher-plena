

## Ajuste de Materiais Complementares - Suporte a Multiplos Tipos

### Problema Atual

Todos os materiais complementares sao tratados como videos do YouTube. Quando o link e de outro tipo (artigo, podcast do Spotify), o sistema tenta embutir em um iframe de video, o que nao funciona.

### Tipos de Links Encontrados no Banco

| Tipo | Exemplo | Jornadas |
|------|---------|----------|
| Video YouTube | youtube.com/watch, youtu.be | Jornadas 1, 2, 3, 5, 6, 7 |
| Podcast Spotify | open.spotify.com/episode/... | Jornada 7, Estacao 1 |
| Artigo/Site | sni.org.br/... | Jornada 5 Est.3, Jornada 7 Est.2 |

### Solucao

1. Adicionar uma coluna `supplementary_type` na tabela `stations` para o admin escolher o tipo do material
2. Atualizar o formulario de cadastro (StationForm) com um seletor de tipo
3. Atualizar a exibicao (StationDetail) para renderizar corretamente cada tipo

### Alteracoes

**1. Migracao de Banco de Dados**

Adicionar a coluna `supplementary_type` na tabela `stations` com valores possiveis: `video`, `article`, `podcast`.

```text
stations
  + supplementary_type TEXT DEFAULT 'video'
    valores: 'video' | 'article' | 'podcast'
```

Apos criar a coluna, atualizar os registros existentes automaticamente:
- Links com `spotify.com` -> tipo `podcast`
- Links com `sni.org.br` (sem youtube) -> tipo `article`
- Demais -> tipo `video` (ja e o default)

**2. `src/types/index.ts`**

Adicionar o tipo `SupplementaryType` e o campo `supplementary_type` na interface `Station`.

**3. `src/components/admin/StationForm.tsx`**

- Adicionar estado para `supplementaryType`
- Adicionar um `Select` com as opcoes: Video, Artigo/Link, Podcast
- O seletor so aparece quando o campo de URL do material complementar esta preenchido
- Salvar o tipo junto com os demais dados da estacao

**4. `src/pages/StationDetail.tsx`**

Ajustar a secao "Material Complementar" (linhas 399-459) para renderizar de acordo com o tipo:

- **video**: Manter o comportamento atual (iframe YouTube/Vimeo em modal)
- **article**: Exibir botao "Abrir Artigo" que abre o link em nova aba (`window.open`)
- **podcast**: Exibir embed do Spotify ou botao "Ouvir Podcast" que abre em nova aba

Os icones e textos dos botoes mudam conforme o tipo:
- Video: icone Play, texto "Assistir Video"
- Artigo: icone ExternalLink, texto "Abrir Artigo"
- Podcast: icone Headphones, texto "Ouvir Podcast"

**5. `src/contexts/DataContext.tsx`**

Incluir `supplementary_type` nas queries de leitura e escrita de estacoes (se necessario, verificar se o campo ja vem automaticamente do Supabase).

### Detalhes Tecnicos

A deteccao automatica via migracao SQL atualiza os registros existentes, evitando que o admin precise reeditar cada estacao manualmente. Novos cadastros terao o seletor disponivel no formulario.

