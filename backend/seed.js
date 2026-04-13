import bcrypt from 'bcryptjs';
import db from './db.js';

console.log('Limpando dados existentes...');
db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM customers; DELETE FROM users;');

console.log('Criando usuário admin (admin@mercos.local / admin123)...');
const hash = bcrypt.hashSync('admin123', 10);
const adminId = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
  .run('Admin', 'admin@mercos.local', hash, 'admin').lastInsertRowid;

console.log('Criando produtos...');
const products = [
  ['SKU-001', 'Camiseta Básica Branca', 'Algodão 100%', 'Vestuário', 49.9, 120, 'https://placehold.co/300x300?text=Camiseta'],
  ['SKU-002', 'Calça Jeans Slim', 'Azul escuro', 'Vestuário', 189.9, 80, 'https://placehold.co/300x300?text=Jeans'],
  ['SKU-003', 'Tênis Running Pro', 'Esportivo leve', 'Calçados', 349.9, 45, 'https://placehold.co/300x300?text=Tenis'],
  ['SKU-004', 'Mochila Executiva', 'Impermeável', 'Acessórios', 229.0, 60, 'https://placehold.co/300x300?text=Mochila'],
  ['SKU-005', 'Boné Trucker', 'Ajustável', 'Acessórios', 59.9, 200, 'https://placehold.co/300x300?text=Bone'],
  ['SKU-006', 'Relógio Digital', 'À prova d’água', 'Eletrônicos', 299.0, 30, 'https://placehold.co/300x300?text=Relogio'],
  ['SKU-007', 'Fone Bluetooth', 'Cancelamento de ruído', 'Eletrônicos', 459.0, 25, 'https://placehold.co/300x300?text=Fone'],
  ['SKU-008', 'Garrafa Térmica 1L', 'Aço inox', 'Utilidades', 89.9, 150, 'https://placehold.co/300x300?text=Garrafa'],
];
const insertProd = db.prepare('INSERT INTO products (sku, name, description, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
const productIds = products.map(p => insertProd.run(...p).lastInsertRowid);

console.log('Criando clientes...');
const customers = [
  ['Loja Alpha LTDA', 'Alpha Store', '12.345.678/0001-90', 'contato@alpha.com', '(11) 99999-0001', 'Av. Paulista, 1000', 'São Paulo', 'SP', '30/60/90', 'Cliente VIP'],
  ['Beta Comércio ME', 'Beta', '98.765.432/0001-10', 'vendas@beta.com', '(21) 99999-0002', 'Rua das Flores, 200', 'Rio de Janeiro', 'RJ', 'À vista', ''],
  ['Gamma Varejo S/A', 'Gamma', '11.222.333/0001-44', 'compras@gamma.com', '(31) 99999-0003', 'Rua Mineira, 50', 'Belo Horizonte', 'MG', '30 dias', ''],
  ['Delta Atacado', 'Delta', '55.666.777/0001-88', 'delta@delta.com', '(41) 99999-0004', 'Av. Iguaçu, 300', 'Curitiba', 'PR', '45 dias', 'Pagamento em boleto'],
];
const insertCust = db.prepare('INSERT INTO customers (company_name, trade_name, document, email, phone, address, city, state, payment_terms, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const customerIds = customers.map(c => insertCust.run(...c).lastInsertRowid);

console.log('Criando pedidos de exemplo...');
const insertOrder = db.prepare('INSERT INTO orders (customer_id, user_id, status, discount, total, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)');

function createOrder(customerId, itemsSpec, status, daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const iso = date.toISOString().replace('T', ' ').slice(0, 19);
  const subtotal = itemsSpec.reduce((a, it) => a + it.qty * it.price, 0);
  const total = subtotal;
  const orderId = insertOrder.run(customerId, adminId, status, 0, total, '', iso).lastInsertRowid;
  for (const it of itemsSpec) {
    insertItem.run(orderId, it.productId, it.qty, it.price, it.qty * it.price);
  }
}

createOrder(customerIds[0], [
  { productId: productIds[0], qty: 20, price: 49.9 },
  { productId: productIds[1], qty: 10, price: 189.9 },
], 'approved', 2);
createOrder(customerIds[1], [
  { productId: productIds[2], qty: 5, price: 349.9 },
  { productId: productIds[6], qty: 3, price: 459.0 },
], 'sent', 5);
createOrder(customerIds[2], [
  { productId: productIds[3], qty: 8, price: 229.0 },
  { productId: productIds[4], qty: 30, price: 59.9 },
], 'approved', 12);
createOrder(customerIds[3], [
  { productId: productIds[5], qty: 6, price: 299.0 },
  { productId: productIds[7], qty: 15, price: 89.9 },
], 'draft', 1);

console.log('Seed concluído!');
console.log('Login: admin@mercos.local / admin123');
