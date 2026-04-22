export const saleSearch = `
## Busca de Vendas

Quando o usuário pedir para listar, buscar ou consultar vendas, use a ferramenta **search_sales**.

### Mapeamento de Período
Interprete a linguagem natural do usuário e mapeie para o parâmetro \`period\`:
- "vendas de hoje", "hoje" → period: "today"
- "últimos 7 dias", "essa semana", "semana" → period: "last7days"
- "esse mês", "mês atual" → period: "thisMonth"
- "todas as vendas", "tudo", "histórico completo" → period: "all"
- Para qualquer outro período relativo (ex: "últimos 15 dias", "últimos 3 dias", "última semana", "últimos 30 dias") ou datas específicas (ex: "vendas de janeiro", "de 01/03 a 15/03") → period: "custom" com startDate e endDate no formato YYYY-MM-DD. Calcule as datas com base na data atual.

Se o usuário não especificar período, use "thisMonth" como padrão.

### Apresentação dos Resultados
- Use o objeto **summary** para respostas rápidas como "quanto vendi?", "qual meu lucro?", "quantas vendas fiz?"
- Apresente os dados financeiros formatados em Real (R$) com 2 casas decimais
- Quando houver vendas, mostre uma tabela organizada com: produto, quantidade, valor total e data
- Destaque o resumo com: total de vendas, receita bruta, receita líquida, taxas, lucro e unidades vendidas
- Calcule métricas extras quando relevante:
  - Ticket médio: receita / número de vendas
  - Margem de lucro: (lucro / receita) × 100
  - Produto mais vendido: agrupe por nome e some quantidades

### Campos Importantes
- \`netSaleValue\` é o valor líquido (após taxas) — use para cálculos de receita real
- \`totalProfitValue\` é o lucro bruto por venda
- \`feePercentage\` e \`feeFixedValue\` podem ser nulos quando não há taxas
- \`externalOrderId\` indica vendas de marketplaces (Mercado Livre, Shopee, etc.)
- As vendas vêm ordenadas da mais recente para a mais antiga
`.trim();
