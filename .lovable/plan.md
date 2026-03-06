

## Plano: Reestruturar a Landing Page pública

### O que muda

A Landing Page atual (`/`) exibe seções dinâmicas do banco `landing_sections`. Será substituída por um layout fixo com:

1. **Logo** centralizada no topo (usando `src/assets/logoSNI.png`)
2. **Imagem banner** da biblioteca de imagens (URL do Supabase Storage para `1766405025490-5vonvbp.png`)
3. **Grid de Estações** em 3 colunas, mostrando as estações disponíveis com suas imagens de card
4. **Botão de login** no final

### Arquivo editado

**`src/pages/LandingPage.tsx`** — reescrever completamente:

- Importar logo de `@/assets/logoSNI.png`
- Buscar estações do Supabase (`stations` table, ordenadas por `order_index`)
- Buscar a URL pública da imagem `1766405025490-5vonvbp.png` do Storage
- Layout:
  - Logo centralizada no topo com fundo branco
  - Imagem banner em largura total abaixo da logo
  - Título "Estações" e grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` com cards das estações (imagem `card_image_url`, título)
  - Botão "Entrar na Plataforma" ao final

### Detalhes técnicos

- As estações serão buscadas diretamente do Supabase (sem autenticação, via query pública) com `select('*').order('order_index')`
- Cada card de estação mostrará a `card_image_url` e o `title`
- Clique no card redireciona para `/login` (pois é página pública)
- A imagem banner será referenciada pela URL pública do Storage

