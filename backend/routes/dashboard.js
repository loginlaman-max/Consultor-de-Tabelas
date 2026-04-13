import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/', (_req, res) => {
  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE active = 1) AS products,
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('sent','approved')) AS revenue
  `).get();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS total
    FROM orders GROUP BY status
  `).all();

  const topProducts = db.prepare(`
    SELECT p.id, p.name, SUM(oi.quantity) AS qty, SUM(oi.subtotal) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('sent','approved')
    GROUP BY p.id
    ORDER BY revenue DESC
    LIMIT 5
  `).all();

  const topCustomers = db.prepare(`
    SELECT c.id, c.company_name, COUNT(o.id) AS orders_count, COALESCE(SUM(o.total), 0) AS revenue
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id AND o.status IN ('sent','approved')
    GROUP BY c.id
    ORDER BY revenue DESC
    LIMIT 5
  `).all();

  const monthly = db.prepare(`
    SELECT strftime('%Y-%m', created_at) AS month, COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE status IN ('sent','approved')
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all();

  res.json({ totals, byStatus, topProducts, topCustomers, monthly: monthly.reverse() });
});

export default router;
