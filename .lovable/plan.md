

## Plano: Reestruturar Dashboard Admin/Professor

Substituir os 4 cards individuais + bloco "Submissões Recentes" por 2 quadros agrupados para admin e professor.

### Layout

Dois cards lado a lado (grid 2 colunas), cada um com título e 4 linhas de dados:

**Quadro 1 — USUÁRIOS**
- Total cadastrados (query real em `profiles`)
- Participantes (role = 'aluno')
- Tutores (role = 'professor')
- Formadoras (role = 'admin')

**Quadro 2 — JORNADAS**
- Qde Jornadas (`journeys.length`)
- Jornadas Ativas (`journeys.length` — todas são ativas por padrão)
- Qde Estações (`stations.length`)
- Qde Avaliações Pendentes (`submissions.filter(s => !s.evaluated_at).length`)

### Dados reais de usuários

Buscar contagens reais via queries ao Supabase:
- `SELECT COUNT(*) FROM profiles` para total
- `SELECT COUNT(*) FROM user_roles WHERE role = 'aluno'` para participantes
- `SELECT COUNT(*) FROM user_roles WHERE role = 'professor'` para tutores
- `SELECT COUNT(*) FROM user_roles WHERE role = 'admin'` para formadoras

Usar `useEffect` + `useState` para carregar as contagens ao montar o componente.

### Mudanças

| Arquivo | Ação |
|---|---|
| `src/pages/Dashboard.tsx` | Substituir bloco admin (4 cards + Submissões Recentes) por 2 quadros agrupados com dados reais. Mesma mudança para professor. |

### Visual

Cada quadro será um `Card` com:
- Header com título e ícone
- 4 linhas internas com label à esquerda e valor à direita, separadas por bordas sutis

