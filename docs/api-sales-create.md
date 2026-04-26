# 📦 API - Registrar Nova Venda

## Endpoint

```
POST /sales/variants/:variantId
```

## Descrição

Registra uma nova venda para uma **variante** específica de um produto. A venda é sempre vinculada a uma variante (SKU), nunca diretamente a um produto.

### ⚠️ Conceito Importante: Variant (Variante)

No Stoquei, um **Produto** pode ter múltiplas **Variantes**. Cada variante representa uma versão específica do produto com seu próprio:

- **SKU** (código único)
- **Preço de custo** (`priceCost`)
- **Preço de venda** (`priceSale`)
- **Estoque** (`stockQuantity`)
- **Metadados** (atributos como cor, tamanho, etc.)

**Exemplo:** O produto "Camiseta Básica" pode ter variantes:

- SKU `CAM-P-AZUL` → Tamanho P, Cor Azul, R$ 49,90
- SKU `CAM-M-PRETA` → Tamanho M, Cor Preta, R$ 49,90
- SKU `CAM-G-BRANCA` → Tamanho G, Cor Branca, R$ 54,90

Para registrar uma venda, você precisa do **ID da variante** (`variantId`), não do ID do produto.

---

## Autenticação

- **Obrigatória**: Token JWT no header `Authorization: Bearer <token>`
- **Guard de Tier**: O endpoint é protegido pelo `TierAccessGuard`

---

## Parâmetros de URL

| Parâmetro   | Tipo   | Obrigatório | Descrição                               |
| ----------- | ------ | ----------- | --------------------------------------- |
| `variantId` | string | ✅ Sim      | UUID da variante que está sendo vendida |

---

## Body (JSON)

| Campo             | Tipo   | Obrigatório | Validação                   | Descrição                                                                 |
| ----------------- | ------ | ----------- | --------------------------- | ------------------------------------------------------------------------- |
| `quantity`        | number | ✅ Sim      | Inteiro, mínimo 1           | Quantidade de unidades vendidas                                           |
| `customSalePrice` | number | ❌ Não      | Decimal (2 casas), mínimo 0 | Preço de venda customizado. Se não enviado, usa o `priceSale` da variante |
| `feePercentage`   | number | ❌ Não      | Decimal (2 casas), mínimo 0 | Taxa percentual sobre a venda (ex: taxa do marketplace)                   |
| `feeFixedValue`   | number | ❌ Não      | Decimal (2 casas), mínimo 0 | Taxa fixa sobre a venda (ex: R$ 2,00 por transação)                       |
| `externalOrderId` | string | ❌ Não      | Máximo 255 caracteres       | ID do pedido externo (ex: número do pedido no Mercado Livre)              |
| `saleDate`        | string | ❌ Não      | Formato `YYYY-MM-DD`        | Data da venda. Se não enviado, usa a data/hora atual                      |

---

## Lógica de Cálculo

A API calcula automaticamente os valores da venda:

```
unitSalePrice = customSalePrice ?? variant.priceSale
totalSaleValue = unitSalePrice × quantity
feeAmount = (totalSaleValue × feePercentage / 100) + feeFixedValue
netSaleValue = totalSaleValue - feeAmount
totalProfitValue = netSaleValue - (variant.priceCost × quantity)
```

**Exemplo numérico:**

- Variante: custo R$ 20,00, venda R$ 50,00
- Venda: 3 unidades, taxa 10%, taxa fixa R$ 2,00
- `totalSaleValue` = 50 × 3 = R$ 150,00
- `feeAmount` = (150 × 10/100) + 2 = R$ 17,00
- `netSaleValue` = 150 - 17 = R$ 133,00
- `totalProfitValue` = 133 - (20 × 3) = R$ 73,00

---

## Validações e Erros

| Situação                      | Código | Mensagem                                |
| ----------------------------- | ------ | --------------------------------------- |
| Variante não encontrada       | 400    | `Variante não encontrada`               |
| Variante inativa              | 400    | `Variante está inativa`                 |
| Estoque insuficiente          | 400    | `Estoque insuficiente para a venda`     |
| `quantity` < 1 ou não inteiro | 400    | Erro de validação do class-validator    |
| `saleDate` formato inválido   | 400    | `saleDate must be in YYYY-MM-DD format` |

---

## Comportamento

1. Busca a variante pelo `variantId` (inclui dados do produto)
2. Valida se a variante existe, está ativa e tem estoque suficiente
3. Calcula todos os valores (venda, taxas, lucro)
4. Cria o registro de venda com **snapshots** dos dados atuais (nome do produto, SKU, categoria)
5. **Decrementa o estoque** da variante automaticamente
6. Tudo roda em uma **transação** — se algo falhar, nada é salvo

### Sobre Snapshots

A venda salva uma "foto" dos dados no momento da venda (`productNameSnapshot`, `skuSnapshot`, `categorySnapshot`). Isso garante que mesmo se o produto for renomeado ou a variante alterada depois, o histórico de vendas permanece íntegro.

---

## Response (200 OK)

```json
{
  "id": "uuid-da-venda",
  "productName": "Camiseta Básica",
  "sku": "CAM-M-PRETA",
  "quantity": 3,
  "unitCostPrice": 20.0,
  "unitSalePrice": 50.0,
  "totalSaleValue": 150.0,
  "totalProfitValue": 73.0,
  "feePercentage": 10.0,
  "feeFixedValue": 2.0,
  "netSaleValue": 133.0,
  "externalOrderId": "MLB-123456"
}
```

| Campo              | Tipo   | Descrição                                      |
| ------------------ | ------ | ---------------------------------------------- |
| `id`               | string | UUID da venda criada                           |
| `productName`      | string | Nome do produto no momento da venda (snapshot) |
| `sku`              | string | SKU da variante no momento da venda (snapshot) |
| `quantity`         | number | Quantidade vendida                             |
| `unitCostPrice`    | number | Preço de custo unitário da variante            |
| `unitSalePrice`    | number | Preço de venda unitário utilizado              |
| `totalSaleValue`   | number | Valor total bruto da venda                     |
| `totalProfitValue` | number | Lucro total (já descontando taxas e custo)     |
| `feePercentage`    | number | Taxa percentual aplicada (se informada)        |
| `feeFixedValue`    | number | Taxa fixa aplicada (se informada)              |
| `netSaleValue`     | number | Valor líquido da venda (bruto - taxas)         |
| `externalOrderId`  | string | ID do pedido externo (se informado)            |

---

## Exemplos com cURL

### Venda simples (apenas campos obrigatórios)

```bash
curl -X POST http://localhost:3000/sales/variants/ID_DA_VARIANTE \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }'
```

### Venda com preço customizado

```bash
curl -X POST http://localhost:3000/sales/variants/ID_DA_VARIANTE \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2,
    "customSalePrice": 45.90
  }'
```

### Venda completa (todos os campos)

```bash
curl -X POST http://localhost:3000/sales/variants/ID_DA_VARIANTE \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5,
    "customSalePrice": 89.90,
    "feePercentage": 12.5,
    "feeFixedValue": 3.00,
    "externalOrderId": "MLB-789012",
    "saleDate": "2025-01-15"
  }'
```

### Venda com taxa de marketplace (sem preço customizado)

```bash
curl -X POST http://localhost:3000/sales/variants/ID_DA_VARIANTE \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1,
    "feePercentage": 16.0,
    "externalOrderId": "SHOPEE-456"
  }'
```

---

## 🤖 Prompt para Agent (ADK)

Use este prompt como instrução para o agent saber como registrar vendas:

````
## Como registrar uma venda na Stoquei API

Para registrar uma venda, você precisa chamar:
POST /sales/variants/{variantId}

### Pré-requisito
Você precisa do ID da VARIANTE (não do produto). Se o usuário informar o nome do produto ou SKU, primeiro busque a variante correspondente para obter o variantId.

### Campos do body:
- "quantity" (OBRIGATÓRIO): número inteiro >= 1. Quantidade de unidades vendidas.
- "customSalePrice" (opcional): número decimal. Preço de venda diferente do cadastrado na variante. Se não informado, usa o preço de venda padrão da variante.
- "feePercentage" (opcional): número decimal. Taxa percentual cobrada (ex: marketplace cobra 12.5%).
- "feeFixedValue" (opcional): número decimal. Taxa fixa cobrada por transação.
- "externalOrderId" (opcional): string. Código do pedido em plataforma externa (Mercado Livre, Shopee, etc).
- "saleDate" (opcional): string no formato "YYYY-MM-DD". Data da venda. Se não informado, registra com a data atual.

### Regras importantes:
1. A variante DEVE estar ativa e ter estoque suficiente para a quantidade informada.
2. O estoque é decrementado automaticamente após a venda.
3. Os cálculos de valor total, taxas e lucro são feitos automaticamente pela API.
4. A venda salva snapshots do nome do produto e SKU, preservando o histórico mesmo se os dados forem alterados depois.

### Como descobrir o variantId:
Antes de registrar a venda, você precisa do variantId. Use o endpoint de listagem de produtos:
GET /products?storeId={storeId}

Esse endpoint retorna todos os produtos da loja, cada um com seu array de variantes:
```json
{
  "id": "product-uuid",
  "name": "Porta Escova de Dentes",
  "category": "Banheiro",
  "variants": [
    { "id": "variant-uuid-1", "sku": "PE-AZUL", "priceCost": 8.00, "priceSale": 29.90, "stockQuantity": 5, "metadata": {"cor": "azul"}, "isActive": true },
    { "id": "variant-uuid-2", "sku": "PE-ROSA", "priceCost": 8.00, "priceSale": 29.90, "stockQuantity": 3, "metadata": {"cor": "rosa"}, "isActive": true },
    { "id": "variant-uuid-3", "sku": "PE-BRANCO", "priceCost": 9.00, "priceSale": 34.90, "stockQuantity": 8, "metadata": {"cor": "branco"}, "isActive": true }
  ]
}
````

### Fluxo recomendado para o agent:

1. Usuário diz algo como "cadastrar venda para porta escova de dentes"
2. Chame GET /products?storeId={storeId} para listar os produtos
3. Filtre pelo nome do produto que o usuário mencionou
4. Se o produto tem **1 variante** → use o variantId direto e registre a venda
5. Se o produto tem **múltiplas variantes** → apresente as opções ao usuário:
   "Encontrei 3 variantes do 'Porta Escova de Dentes':
   1. SKU: PE-AZUL — R$ 29,90 (5 em estoque)
   2. SKU: PE-ROSA — R$ 29,90 (3 em estoque)
   3. SKU: PE-BRANCO — R$ 34,90 (8 em estoque)
      Para qual deseja registrar a venda?"
6. Após o usuário escolher, chame POST /sales/variants/{variantId}

### Exemplo mínimo:

POST /sales/variants/abc-123-uuid
{ "quantity": 2 }

### Exemplo completo:

POST /sales/variants/abc-123-uuid
{
"quantity": 3,
"customSalePrice": 59.90,
"feePercentage": 10,
"feeFixedValue": 2.00,
"externalOrderId": "MLB-999",
"saleDate": "2025-06-20"
}

```

```
