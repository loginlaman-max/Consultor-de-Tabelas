import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/', (req, res) => {
  const { q = '' } = req.query;
  const rows = db.prepare(`
    SELECT * FROM customers
    WHERE company_name LIKE ? OR trade_name LIKE ? OR document LIKE ? OR city LIKE ?
    ORDER BY company_name
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Cliente não encontrado' });
  const orders = db.prepare('SELECT id, status, total, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...row, orders });
});

router.post('/', (req, res) => {
  const { company_name, trade_name, document, email, phone, address, city, state, payment_terms, notes } = req.body || {};
  if (!company_name) return res.status(400).json({ error: 'Razão social é obrigatória' });
  const info = db.prepare(`
    INSERT INTO customers (company_name, trade_name, document, email, phone, address, city, state, payment_terms, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(company_name, trade_name || '', document || '', email || '', phone || '', address || '', city || '', state || '', payment_terms || '', notes || '');
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { company_name, trade_name, document, email, phone, address, city, state, payment_terms, notes } = req.body || {};
  db.prepare(`
    UPDATE customers SET company_name=?, trade_name=?, document=?, email=?, phone=?, address=?, city=?, state=?, payment_terms=?, notes=?
    WHERE id=?
  `).run(company_name, trade_name || '', document || '', email || '', phone || '', address || '', city || '', state || '', payment_terms || '', notes || '', req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
