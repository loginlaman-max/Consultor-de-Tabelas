import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/', (req, res) => {
  const { q = '', category = '' } = req.query;
  const rows = db.prepare(`
    SELECT * FROM products
    WHERE active = 1
      AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)
      AND (? = '' OR category = ?)
    ORDER BY name
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, category, category);
  res.json(rows);
});

router.get('/categories', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> "" ORDER BY category').all();
  res.json(rows.map(r => r.category));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { sku, name, description, category, price, stock, image_url } = req.body || {};
  if (!sku || !name) return res.status(400).json({ error: 'SKU e nome são obrigatórios' });
  try {
    const info = db.prepare(`
      INSERT INTO products (sku, name, description, category, price, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sku, name, description || '', category || '', Number(price) || 0, Number(stock) || 0, image_url || '');
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const { sku, name, description, category, price, stock, image_url, active } = req.body || {};
  db.prepare(`
    UPDATE products SET sku=?, name=?, description=?, category=?, price=?, stock=?, image_url=?, active=?
    WHERE id=?
  `).run(sku, name, description || '', category || '', Number(price) || 0, Number(stock) || 0, image_url || '', active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
