import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/', (req, res) => {
  const { status = '' } = req.query;
  const rows = db.prepare(`
    SELECT o.*, c.company_name AS customer_name
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE (? = '' OR o.status = ?)
    ORDER BY o.created_at DESC
  `).all(status, status);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const order = db.prepare(`
    SELECT o.*, c.company_name AS customer_name, c.document AS customer_document
    FROM orders o JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  const items = db.prepare(`
    SELECT oi.*, p.name AS product_name, p.sku
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(req.params.id);
  res.json({ ...order, items });
});

router.post('/', (req, res) => {
  const { customer_id, items = [], discount = 0, notes = '', status = 'draft' } = req.body || {};
  if (!customer_id || !items.length) return res.status(400).json({ error: 'Cliente e itens são obrigatórios' });

  const tx = db.transaction(() => {
    const subtotal = items.reduce((acc, it) => acc + Number(it.unit_price) * Number(it.quantity), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));
    const info = db.prepare(`
      INSERT INTO orders (customer_id, user_id, status, discount, total, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(customer_id, req.user.id, status, Number(discount) || 0, total, notes);
    const orderId = info.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const it of items) {
      const sub = Number(it.unit_price) * Number(it.quantity);
      insertItem.run(orderId, it.product_id, it.quantity, it.unit_price, sub);
    }
    return orderId;
  });

  try {
    const id = tx();
    res.json({ id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!['draft', 'sent', 'approved', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
