
## Ocultar Bloco de Atividade Quando Não Há Atividade

### Objetivo
Mostrar a seção de Atividade apenas quando existir pelo menos uma atividade definida para a estação.

### Situação Atual
O bloco de Atividade é sempre renderizado, exibindo a mensagem "Nenhuma atividade disponível para esta estação" quando não há atividades.

### Mudança Necessária
Envolver toda a seção de Atividade em uma condição que verifica a existência de `firstActivity`.

### Arquivo a Modificar
- `src/pages/StationDetail.tsx`

### Detalhes Técnicos

**Linhas 145-174 - De:**
```tsx
{/* Activity Section */}
<Card>
  <div className="w-full overflow-hidden rounded-t-lg">
    <img src={atividadeTitleImage} alt="Atividade" ... />
  </div>
  <CardContent className="pt-4">
    {firstActivity ? (
      // botão de atividade
    ) : (
      // mensagem "Nenhuma atividade disponível"
    )}
  </CardContent>
</Card>
```

**Para:**
```tsx
{/* Activity Section - Only show if there are activities */}
{firstActivity && (
  <Card>
    <div className="w-full overflow-hidden rounded-t-lg">
      <img src={atividadeTitleImage} alt="Atividade" ... />
    </div>
    <CardContent className="pt-4">
      <div className="flex justify-center">
        <div 
          onClick={handleActivityClick}
          className="cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
        >
          <img src={activityButtonImage} alt="Acessar Atividade" ... />
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### Resultado
- Estações **com** atividades: exibem o bloco normalmente com o botão de acesso
- Estações **sem** atividades: o bloco de atividade não aparece na página
