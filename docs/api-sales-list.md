# 📊 API - Listagem de Vendas

## Endpoint

```
GET /sales/stores/:storeId/history
```

## 🔐 Autenticação

**Requer autenticação:** ✅ SIM

- Necessário enviar token JWT no header `Authorization`
- Token obtido através do login (`POST /auth/signin`)
- Formato: `Bearer {seu_token_jwt}`

## 📝 Descrição

Lista todas as vendas de uma loja específica com filtros de período e resumo financeiro consolidado.

## 🎯 Parâmetros

### Path Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| `storeId` | string | ✅ Sim      | ID único da loja (UUID)      |

### Query Parameters

| Parâmetro   | Tipo   | Obrigatório | Valores Aceitos                                      | Padrão      | Descrição                           |
|-------------|--------|-------------|------------------------------------------------------|-------------|-------------------------------------|
| `period`    | string | ❌ Não      | `today`, `last7days`, `thisMonth`, `all`, `custom`   | `thisMonth` | Filtro de período das vendas        |
| `startDate` | string | ❌ Não      | Formato: `YYYY-MM-DD`                                | -           | Data inicial (apenas com `custom`)  |
| `endDate`   | string | ❌ Não      | Formato: `YYYY-MM-DD`                                | -           | Data final (apenas com `custom`)    |

### Filtros de Período

- **`today`**: Vendas de hoje
- **`last7days`**: Últimos 7 dias
- **`thisMonth`**: Mês atual
- **`all`**: Todas as vendas
- **`custom`**: Período personalizado (requer `startDate` e `endDate`)

## 📤 Response

### Status Code: `200 OK`

```json
{
  "sales": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Camiseta Básica",
      "category": "Vestuário",
      "sku": "CAM-BAS-001",
      "quantity": 2,
      "unitCostPrice": 25.50,
      "unitSalePrice": 59.90,
      "totalSaleValue": 119.80,
      "totalProfitValue": 68.80,
      "feePercentage": 10.5,
      "feeFixedValue": 2.00,
      "netSaleValue": 105.21,
      "externalOrderId": "MP-123456789",
      "saleDate": "2025-01-15T14:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "productName": "Calça Jeans",
      "category": "Vestuário",
      "sku": "CAL-JEA-002",
      "quantity": 1,
      "unitCostPrice": 80.00,
      "unitSalePrice": 189.90,
      "totalSaleValue": 189.90,
      "totalProfitValue": 109.90,
      "feePercentage": null,
      "feeFixedValue": null,
      "netSaleValue": 189.90,
      "externalOrderId": null,
      "saleDate": "2025-01-14T10:15:00.000Z"
    }
  ],
  "summary": {
    "totalSales": 2,
    "totalRevenue": 309.70,
    "totalNetRevenue": 295.11,
    "totalFees": 14.59,
    "totalProfit": 178.70,
    "totalUnits": 3
  }
}
```

### Estrutura da Response

#### `sales[]` - Array de Vendas

| Campo              | Tipo     | Descrição                                          |
|--------------------|----------|----------------------------------------------------|
| `id`               | string   | ID único da venda (UUID)                           |
| `productName`      | string   | Nome do produto no momento da venda (snapshot)     |
| `category`         | string?  | Categoria do produto (pode ser null)               |
| `sku`              | string   | Código SKU da variante vendida (snapshot)          |
| `quantity`         | number   | Quantidade vendida                                 |
| `unitCostPrice`    | number   | Preço de custo unitário                            |
| `unitSalePrice`    | number   | Preço de venda unitário                            |
| `totalSaleValue`   | number   | Valor total da venda (quantidade × preço)          |
| `totalProfitValue` | number   | Lucro bruto (venda - custo)                        |
| `feePercentage`    | number?  | Taxa percentual cobrada (ex: marketplace)          |
| `feeFixedValue`    | number?  | Taxa fixa cobrada                                  |
| `netSaleValue`     | number   | Valor líquido após taxas                           |
| `externalOrderId`  | string?  | ID do pedido externo (ex: Mercado Livre, Shopee)  |
| `saleDate`         | string   | Data/hora da venda (ISO 8601)                      |

#### `summary` - Resumo Consolidado

| Campo              | Tipo   | Descrição                                    |
|--------------------|--------|----------------------------------------------|
| `totalSales`       | number | Número total de vendas                       |
| `totalRevenue`     | number | Receita total bruta                          |
| `totalNetRevenue`  | number | Receita líquida (após taxas)                |
| `totalFees`        | number | Total de taxas cobradas                      |
| `totalProfit`      | number | Lucro total (receita - custos)               |
| `totalUnits`       | number | Total de unidades vendidas                   |

## 🔧 Exemplos de Uso

### 1. Listar vendas do mês atual (padrão)

```bash
curl -X GET "http://localhost:3000/sales/stores/abc123-store-id/history" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Listar vendas de hoje

```bash
curl -X GET "http://localhost:3000/sales/stores/abc123-store-id/history?period=today" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Listar últimos 7 dias

```bash
curl -X GET "http://localhost:3000/sales/stores/abc123-store-id/history?period=last7days" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Listar todas as vendas

```bash
curl -X GET "http://localhost:3000/sales/stores/abc123-store-id/history?period=all" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Período personalizado

```bash
curl -X GET "http://localhost:3000/sales/stores/abc123-store-id/history?period=custom&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## ⚠️ Erros Possíveis

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa:** Token JWT ausente ou inválido

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied"
}
```
**Causa:** Usuário não tem permissão para acessar esta loja

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Store not found"
}
```
**Causa:** Loja não existe ou foi deletada

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```
**Causa:** Formato de data inválido nos parâmetros `startDate` ou `endDate`

## 💡 Dicas para Integração com IA Agent

### 1. Parâmetros Flexíveis
O agent pode interpretar linguagem natural e mapear para os filtros:
- "vendas de hoje" → `period=today`
- "vendas da semana" → `period=last7days`
- "vendas de janeiro" → `period=custom&startDate=2025-01-01&endDate=2025-01-31`

### 2. Análise do Summary
Use o objeto `summary` para respostas rápidas:
- "Quanto vendi hoje?" → `summary.totalRevenue`
- "Qual meu lucro?" → `summary.totalProfit`
- "Quantas vendas fiz?" → `summary.totalSales`

### 3. Filtros por Produto
Após obter a lista, o agent pode filtrar por:
- Nome do produto: `sales.filter(s => s.productName.includes('Camiseta'))`
- Categoria: `sales.filter(s => s.category === 'Vestuário')`
- SKU específico: `sales.filter(s => s.sku === 'CAM-BAS-001')`

### 4. Cálculos Adicionais
Com os dados retornados, o agent pode calcular:
- Ticket médio: `totalRevenue / totalSales`
- Margem de lucro: `(totalProfit / totalRevenue) * 100`
- Produto mais vendido: agrupar por `productName` e somar `quantity`

## 🔗 Endpoints Relacionados

- `POST /auth/signin` - Obter token de autenticação
- `GET /stores` - Listar lojas do usuário
- `POST /sales/variants/:variantId` - Registrar nova venda
- `GET /products/stores/:storeId` - Listar produtos da loja

## 📌 Notas Importantes

1. **Snapshot de Dados**: Os campos `productName`, `category` e `sku` são snapshots do momento da venda, preservando o histórico mesmo se o produto for alterado posteriormente.

2. **Taxas Opcionais**: `feePercentage` e `feeFixedValue` são opcionais e podem ser `null` se não houver taxas.

3. **Ordenação**: As vendas são retornadas ordenadas por data (mais recentes primeiro).

4. **Timezone**: Todas as datas estão em UTC (ISO 8601). Ajuste para o timezone local conforme necessário.

5. **Paginação**: Atualmente não há paginação. Para grandes volumes, considere usar filtros de período.
