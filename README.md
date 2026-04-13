# Mercos Clone — Força de Vendas B2B

Aplicativo full-stack inspirado no Mercos, com módulos de **Catálogo de Produtos**, **CRM de Clientes**, **Pedidos/Carrinho** e **Dashboard**.

> O arquivo legado `Index.html` (Buscador e Otimizador Inteligente) continua no repositório e pode ser aberto independentemente.

## Stack

- **Backend**: Node.js + Express + SQLite (`better-sqlite3`) + JWT
- **Frontend**: React + Vite + Tailwind CSS + React Router

## Estrutura

```
backend/    API REST + SQLite
frontend/   SPA React
Index.html  Ferramenta legada (standalone)
```

## Rodando localmente

### 1. Backend

```bash
cd backend
cp .env.example .env        # ajuste JWT_SECRET
npm install
npm run seed                # cria DB + usuário demo + dados de exemplo
npm run dev                 # API em http://localhost:4000
```

Usuário demo: **admin@mercos.local** / **admin123**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # app em http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:4000`, então basta abrir `http://localhost:5173` e fazer login.

## Funcionalidades

### Dashboard (`/`)
- Totais de produtos, clientes, pedidos e receita
- Gráfico de receita mensal
- Pedidos por status
- Top 5 produtos e clientes

### Catálogo (`/products`)
- CRUD de produtos (SKU, nome, categoria, preço, estoque, imagem)
- Busca por texto e filtro por categoria

### Clientes (`/customers`)
- Cadastro de clientes (razão social, documento, contato, endereço, condições)
- Página de detalhe com histórico de pedidos

### Pedidos (`/orders`)
- Lista com filtro por status
- **Novo pedido** (`/orders/new`): selecionar cliente, montar carrinho, editar quantidades/preços, aplicar desconto, salvar como rascunho ou enviar
- Detalhe do pedido com transições de status (rascunho → enviado → aprovado / cancelado)

## API

Todas as rotas (exceto `/api/auth/*`) exigem header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| GET  | `/api/products` | Lista (params `q`, `category`) |
| POST/PUT/DELETE | `/api/products[/:id]` | CRUD |
| GET  | `/api/customers` | Lista (param `q`) |
| GET  | `/api/customers/:id` | Detalhe + histórico |
| POST/PUT/DELETE | `/api/customers[/:id]` | CRUD |
| GET  | `/api/orders` | Lista (param `status`) |
| GET  | `/api/orders/:id` | Detalhe + itens |
| POST | `/api/orders` | Criar pedido com itens |
| PATCH| `/api/orders/:id/status` | Alterar status |
| GET  | `/api/dashboard` | Agregados para o dashboard |

## Próximos passos sugeridos

- Upload de imagens de produtos
- Múltiplos vendedores com comissão
- Importação de produtos via CSV (reaproveitando o `Index.html`)
- PDF/impressão de pedidos
- PWA / offline-first
