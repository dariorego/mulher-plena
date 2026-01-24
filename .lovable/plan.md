
# Plano: Criar Componente Árvore da Gratidão

## Resumo
Implementar um componente visual interativo de árvore genealógica para a atividade "Árvore da Gratidão", permitindo que as participantes registrem 15 pessoas da família com seus respectivos aprendizados em uma estrutura hierárquica visual.

## Arquitetura da Solução

### Estrutura da Árvore Genealógica (15 posições)
A estrutura típica de uma árvore genealógica simples com 15 espaços:

```text
                    [Bisavó 1] [Bisavó 2] [Bisavó 3] [Bisavó 4]
                         \       /             \       /
                          [Avó 1]               [Avó 2]
                              \                   /
                         [Pai/Mãe 1]       [Pai/Mãe 2]
                               \               /
                                    [Você]
                                       |
                               [Filho/Outros]
```

Considerando 15 posições, proponho uma estrutura visual em camadas:
- Nível 4 (topo): 4 espaços (Bisavós)
- Nível 3: 4 espaços (Avós)
- Nível 2: 4 espaços (Pais, Tios)
- Nível 1: 2 espaços (Irmãos, Cônjuge)
- Nível 0: 1 espaço (Você ou Filhos)

## Mudanças Propostas

### 1. Criar Componente `FamilyTreeActivity`
**Novo arquivo**: `src/components/activities/FamilyTreeActivity.tsx`

- Estado para 15 entradas: cada entrada contém `name` (nome da pessoa) e `learning` (aprendizado)
- Layout visual de árvore usando CSS Grid/Flexbox
- Campos de entrada posicionados sobre a estrutura visual
- Design responsivo adaptável a telas menores
- Validação de preenchimento mínimo antes de enviar

### 2. Atualizar `ActivityPage.tsx`
- Adicionar função `isFamilyTreeActivity()` para detectar atividade pelo título "Árvore da Gratidão"
- Importar e renderizar o componente `FamilyTreeActivity` quando apropriado
- Integrar com sistema de submissão existente

### 3. Interface Visual
O componente terá:
- Background decorativo sugerindo galhos de árvore conectando os membros
- 15 cards posicionados em formato de árvore genealógica
- Cada card com dois campos:
  - **Pessoa da Família**: Input para nome/parentesco
  - **Aprendizado**: Textarea para registrar o aprendizado associado
- Indicador de progresso mostrando quantos espaços foram preenchidos
- Cores e estilo consistentes com o tema da aplicação (tons burgundy, dourado, creme)

## Detalhes Técnicos

### Estado do Componente
```typescript
interface FamilyMember {
  relation: string;  // Ex: "Avó Materna", "Pai"
  name: string;      // Nome da pessoa
  learning: string;  // Aprendizado associado
}

const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
  Array(15).fill({ relation: '', name: '', learning: '' })
);
```

### Layout da Árvore (CSS)
```text
Linha 1: ████ ████ ████ ████  (4 cards - bisavós/ancestrais)
Linha 2: ████   ████   ████  (4 cards - avós)  
Linha 3:   ████     ████     (4 cards - pais/tios)
Linha 4:     ████  ████      (2 cards - irmãos/cônjuge)
Linha 5:       ████          (1 card - você/filhos)
```

### Formatação para Submissão
```typescript
const formatFamilyTreeContent = () => {
  return familyMembers
    .filter(m => m.name.trim() || m.learning.trim())
    .map((member, i) => 
      `**${member.relation || `Membro ${i + 1}`}:** ${member.name}\n**Aprendizado:** ${member.learning}`
    )
    .join('\n\n---\n\n');
};
```

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/activities/FamilyTreeActivity.tsx` | Criar | Novo componente de árvore genealógica |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar o novo componente |

## Experiência do Usuário

1. A participante acessa a atividade "Árvore da Gratidão"
2. Vê a orientação explicando o exercício
3. Visualiza a estrutura de árvore com 15 espaços vazios
4. Para cada espaço, pode preencher:
   - O parentesco/nome da pessoa
   - O aprendizado associado a essa pessoa
5. Indicador visual mostra progresso (ex: "5/15 preenchidos")
6. Botão de enviar fica habilitado quando houver pelo menos 3 registros preenchidos
7. Ao enviar, os dados são formatados e salvos como submissão

## Considerações de Responsividade
- Em telas grandes: layout em formato de árvore completo
- Em telas médias: árvore mais compacta
- Em telas pequenas: lista vertical com indicação de níveis genealógicos
