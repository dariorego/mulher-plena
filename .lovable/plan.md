

## Melhorias na Pagina de Usuarios

### 1. Filtros de busca
Adicionar na parte superior da lista de usuarios dois filtros:
- **Campo de texto** para buscar por nome (filtragem em tempo real enquanto digita)
- **Select de perfil** com opcoes: Todos, Administrador(a), Tutor(a), Participante

### 2. Edicao de nome do usuario
Ao lado do nome de cada usuario, adicionar um botao de edicao (icone de lapis). Ao clicar:
- O nome se transforma em um campo de texto editavel (inline)
- Botoes de confirmar e cancelar aparecem
- Ao confirmar, atualiza o nome na tabela `profiles` do Supabase
- Feedback via toast de sucesso ou erro

### 3. Icones de status das jornadas
Para cada usuario com role "aluno", exibir na linha do usuario uma sequencia de 9 circulos/icones representando as jornadas (ordenadas por `order_index`), com cores indicando o status:
- **Verde**: jornada 100% concluida
- **Amarelo**: jornada em andamento (progresso > 0% e < 100%)
- **Vermelho**: jornada com acesso liberado mas nao iniciada (0%)
- **Cinza**: jornada sem acesso liberado (nao contratada)

Os icones exibirao o numero da jornada dentro e um tooltip com o nome e percentual de progresso ao passar o mouse.

### Detalhes Tecnicos

**Arquivo principal**: `src/pages/UsersPage.tsx`

**Alteracoes necessarias**:

1. **Estado de filtros**: Adicionar `searchName` (string) e `filterRole` (string) ao estado do componente

2. **Logica de filtragem**: Criar `filteredUsers` derivado de `users` aplicando os filtros antes do `.map()` de renderizacao

3. **Edicao de nome**:
   - Estado `editingUserId` e `editingName` para controlar qual usuario esta sendo editado
   - Funcao `handleNameUpdate` que faz `supabase.from('profiles').update({ name }).eq('id', userId)`
   - Atualiza o estado local `users` apos sucesso

4. **Icones de jornadas**:
   - Importar `useData` do DataContext para acessar `journeys`, `journeyAccess`, `getJourneyProgress`
   - Para cada participante, mapear as jornadas ordenadas e calcular o status com base em:
     - `journeyAccess` para verificar se tem acesso
     - `getJourneyProgress(userId, journeyId)` para o percentual
   - Renderizar circulos coloridos com numeros dentro, usando Tooltip para detalhes

5. **Componente de filtro**: Renderizar um bloco com `Input` e `Select` entre os cards de contagem e a lista de usuarios

**Nao requer migracoes de banco** - todas as tabelas e funcoes necessarias ja existem.

