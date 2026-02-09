

# Plano: Adicionar tabela ilustrativa na orientacao da Acao de Amor Concreta

## Objetivo

Inserir uma tabela visual na secao de orientacao da atividade "Acao de Amor Concreta", mostrando as colunas "Membro da familia", "Acao realizada" e "Registre a sensacao ou sentimento" como referencia para o participante antes de preencher os campos interativos.

## Alteracao

| Arquivo | Descricao |
|---------|-----------|
| `src/components/activities/LoveActionActivity.tsx` | Adicionar uma tabela HTML ilustrativa entre o texto de orientacao e a secao interativa "Seus Registros" |

## Detalhes

Sera inserida uma tabela estilizada entre a descricao/orientacao e a secao "Seus Registros", com o seguinte formato:

```text
+---------------------+---------------------+-------------------------------+
| Membro da familia   | Acao realizada      | Registre a sensacao ou        |
|                     |                     | sentimento                    |
+---------------------+---------------------+-------------------------------+
|                     |                     |                               |
+---------------------+---------------------+-------------------------------+
```

A tabela tera:
- Cabecalho com fundo na cor primaria (mesmo estilo da tabela interativa ja existente)
- Uma ou duas linhas vazias para indicar que o participante deve preencher
- Borda suave e cantos arredondados, seguindo o design ja utilizado no componente

Essa tabela funciona como uma referencia visual da proposta antes da area interativa onde o participante realmente preenche os dados.

## Resultado Esperado

O participante vera:
1. Texto de orientacao (descricao da atividade)
2. Tabela ilustrativa mostrando o formato esperado (nova)
3. Secao interativa "Seus Registros" com os campos para preenchimento (ja existente)

