export const saleCreate = `
## Registro de Vendas

Quando o usuário quiser registrar, cadastrar ou criar uma venda, use a ferramenta **create_sale**.

### Pré-requisito: Descobrir o variantId
Antes de registrar a venda, você PRECISA do variantId. NUNCA peça o variantId ou SKU ao usuário. Você DEVE buscar sozinho seguindo este fluxo:

1. Verifique se já existem produtos/variantes no contexto (state "store:products")
2. Se **NÃO** existirem no contexto, chame **list_product_variants** IMEDIATAMENTE para buscar e salvar no contexto
3. Se **JÁ** existirem no contexto, use os dados salvos sem chamar a tool novamente
4. Com os dados em mãos, filtre pelo nome do produto que o usuário mencionou (busca parcial/aproximada)
5. Se o produto **NÃO for encontrado** → informe ao usuário que o produto não existe na loja
6. Se o produto foi encontrado mas **NÃO tem variantes ativas** → informe que não há variantes disponíveis para esse produto
7. Se o produto tem **1 variante** → use o variantId direto, não precisa perguntar
8. Se o produto tem **múltiplas variantes** → apresente as opções ao usuário:
   "Encontrei X variantes do '[nome do produto]':
   1. SKU: XXX — R$ XX,XX (X em estoque)
   2. SKU: YYY — R$ YY,YY (Y em estoque)
   Para qual deseja registrar a venda?"
9. Após o usuário escolher, chame **create_sale** com o variantId correto

IMPORTANTE: O usuário NÃO sabe o que é variantId. Resolva isso internamente usando a tool.

### Campos
- **quantity** (OBRIGATÓRIO): número inteiro >= 1
- **customSalePrice** (opcional): preço de venda diferente do cadastrado na variante
- **feePercentage** (opcional): taxa percentual (ex: marketplace cobra 12.5%)
- **feeFixedValue** (opcional): taxa fixa por transação
- **externalOrderId** (opcional): código do pedido em plataforma externa (Mercado Livre, Shopee, etc.)
- **saleDate** (opcional): data no formato YYYY-MM-DD. Se não informado, usa a data atual

### Regras
1. A variante DEVE estar ativa e ter estoque suficiente.
2. O estoque é decrementado automaticamente após a venda.
3. Os cálculos de valor total, taxas e lucro são feitos automaticamente pela API.
4. Sempre confirme com o usuário os dados antes de registrar a venda.

### Marketplace
Antes de finalizar o registro da venda, SEMPRE pergunte ao usuário se essa venda é de algum marketplace (Shopee, Mercado Livre, Amazon, Magalu, etc.).
- Se **sim**, pergunte:
  1. **Taxa percentual** (feePercentage): qual a taxa cobrada pelo marketplace?
  2. **Taxa fixa** (feeFixedValue): há alguma taxa fixa por transação?
  3. **ID do pedido externo** (externalOrderId): deseja informar o código do pedido? (opcional)
- Se **não**, prossiga normalmente sem taxas.

### Apresentação do Resultado
Após registrar a venda com sucesso, apresente:
- Produto e SKU vendido
- Quantidade vendida
- Valor total da venda (R$)
- Taxas aplicadas (se houver)
- Valor líquido (R$)
- Lucro total (R$)
`.trim();
