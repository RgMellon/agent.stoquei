# Fluxo de Cadastro de Produtos e Variantes

## 📋 Visão Geral

O cadastro de produtos no Stoquei segue um fluxo em duas etapas:
1. **Criar o Produto** - Cadastro básico com nome, descrição e categoria
2. **Criar Variantes** - Adicionar SKUs com preços e estoque

## 🔐 Autenticação

Todos os endpoints requerem autenticação via JWT token do Supabase.

```bash
# Header obrigatório em todas as requisições
Authorization: Bearer <seu_token_jwt>
```

---

## 1️⃣ CADASTRO DE PRODUTO

### Endpoint
```
POST /products
```

### Campos Obrigatórios
- `storeId` (string) - ID da loja onde o produto será cadastrado
- `name` (string) - Nome do produto

### Campos Opcionais
- `description` (string) - Descrição detalhada do produto
- `category` (string) - Categoria do produto

### Exemplo de Request

```bash
curl -X POST https://api.stoquei.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "storeId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Camiseta Básica",
    "description": "Camiseta 100% algodão, confortável e durável",
    "category": "Vestuário"
  }'
```

### Exemplo de Response

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "storeId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Básica",
  "description": "Camiseta 100% algodão, confortável e durável",
  "category": "Vestuário",
  "isArchived": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 2️⃣ CADASTRO DE VARIANTES

Após criar o produto, você pode adicionar variantes (SKUs) com diferentes preços e quantidades de estoque.

### Endpoint
```
POST /variants
```

### Campos Obrigatórios
- `productId` (string) - ID do produto criado anteriormente
- `variants` (array) - Lista de variantes a serem criadas

### Estrutura de cada Variante
- `priceCost` (number) - Preço de custo (mínimo: 0)
- `priceSale` (number) - Preço de venda (mínimo: 0)
- `stockQuantity` (number) - Quantidade em estoque (mínimo: 0)
- `sku` (string, opcional) - Código SKU da variante
- `metadata` (object, opcional) - Dados adicionais em formato JSON

### Exemplo 1: Variante Única (Produto Simples)

```bash
curl -X POST https://api.stoquei.com/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "variants": [
      {
        "sku": "CAM-BAS-001",
        "priceCost": 25.00,
        "priceSale": 49.90,
        "stockQuantity": 100
      }
    ]
  }'
```

### Exemplo 2: Múltiplas Variantes (Tamanhos)

```bash
curl -X POST https://api.stoquei.com/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "variants": [
      {
        "sku": "CAM-BAS-P",
        "priceCost": 25.00,
        "priceSale": 49.90,
        "stockQuantity": 50,
        "metadata": {
          "size": "P",
          "color": "Branca"
        }
      },
      {
        "sku": "CAM-BAS-M",
        "priceCost": 25.00,
        "priceSale": 49.90,
        "stockQuantity": 80,
        "metadata": {
          "size": "M",
          "color": "Branca"
        }
      },
      {
        "sku": "CAM-BAS-G",
        "priceCost": 27.00,
        "priceSale": 54.90,
        "stockQuantity": 60,
        "metadata": {
          "size": "G",
          "color": "Branca"
        }
      }
    ]
  }'
```

### Exemplo 3: Variantes com Cores e Tamanhos

```bash
curl -X POST https://api.stoquei.com/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "variants": [
      {
        "sku": "CAM-BRA-P",
        "priceCost": 25.00,
        "priceSale": 49.90,
        "stockQuantity": 30,
        "metadata": {
          "size": "P",
          "color": "Branca"
        }
      },
      {
        "sku": "CAM-BRA-M",
        "priceCost": 25.00,
        "priceSale": 49.90,
        "stockQuantity": 50,
        "metadata": {
          "size": "M",
          "color": "Branca"
        }
      },
      {
        "sku": "CAM-PRE-P",
        "priceCost": 27.00,
        "priceSale": 54.90,
        "stockQuantity": 25,
        "metadata": {
          "size": "P",
          "color": "Preta"
        }
      },
      {
        "sku": "CAM-PRE-M",
        "priceCost": 27.00,
        "priceSale": 54.90,
        "stockQuantity": 40,
        "metadata": {
          "size": "M",
          "color": "Preta"
        }
      }
    ]
  }'
```

### Exemplo de Response

```json
{
  "message": "Variants created successfully",
  "variants": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "sku": "CAM-BAS-P",
      "priceCost": 25.00,
      "priceSale": 49.90,
      "stockQuantity": 50,
      "metadata": {
        "size": "P",
        "color": "Branca"
      },
      "isArchived": false,
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

---

## 3️⃣ OPERAÇÕES ADICIONAIS

### Listar Produtos de uma Loja

```bash
curl -X GET "https://api.stoquei.com/products?storeId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Atualizar Variante

```bash
curl -X PATCH https://api.stoquei.com/variants/{variantId}/{storeId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "priceCost": 28.00,
    "priceSale": 55.90,
    "stockQuantity": 75,
    "metadata": {
      "size": "M",
      "color": "Azul"
    }
  }'
```

### Repor Estoque (Adicionar Quantidade)

```bash
curl -X PUT https://api.stoquei.com/variants/{variantId}/replenish/{storeId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "priceCost": 25.00,
    "stockQuantity": 50
  }'
```

### Arquivar Produto

```bash
curl -X PUT https://api.stoquei.com/products/{productId}/archive/{storeId} \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Arquivar Variante

```bash
curl -X PUT https://api.stoquei.com/variants/{variantId}/archive/{storeId} \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔄 Fluxo Completo de Cadastro

### Cenário: Cadastrar Camiseta com 3 Tamanhos

#### Passo 1: Criar o Produto
```bash
curl -X POST https://api.stoquei.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "storeId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Camiseta Premium",
    "description": "Camiseta de alta qualidade",
    "category": "Vestuário"
  }'
```

**Response:** Guarde o `id` retornado (ex: `7c9e6679-7425-40de-944b-e07fc1f90ae7`)

#### Passo 2: Criar as Variantes
```bash
curl -X POST https://api.stoquei.com/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "variants": [
      {
        "sku": "CAM-PREM-P",
        "priceCost": 30.00,
        "priceSale": 69.90,
        "stockQuantity": 40,
        "metadata": { "size": "P" }
      },
      {
        "sku": "CAM-PREM-M",
        "priceCost": 30.00,
        "priceSale": 69.90,
        "stockQuantity": 60,
        "metadata": { "size": "M" }
      },
      {
        "sku": "CAM-PREM-G",
        "priceCost": 32.00,
        "priceSale": 74.90,
        "stockQuantity": 50,
        "metadata": { "size": "G" }
      }
    ]
  }'
```

---

## 📝 Notas Importantes

### Validações
- Todos os preços e quantidades devem ser >= 0
- `storeId` e `productId` devem ser UUIDs válidos
- O usuário autenticado deve ter acesso à loja especificada

### Metadata
- Campo `metadata` aceita qualquer estrutura JSON
- Útil para armazenar atributos personalizados (cor, tamanho, material, etc)
- Não há validação de estrutura, é totalmente flexível

### SKU
- Campo opcional, mas recomendado para controle
- Se não informado, o sistema pode gerar automaticamente
- Deve ser único dentro do produto

### Segurança
- Todas as operações verificam se a loja pertence ao usuário autenticado
- Produtos e variantes só podem ser acessados pelo dono da loja
- Token JWT deve ser válido e não expirado

### Arquivamento
- Produtos e variantes arquivados não são deletados
- Mantém histórico de vendas intacto
- Podem ser reativados posteriormente
