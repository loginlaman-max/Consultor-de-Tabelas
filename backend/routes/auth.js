import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { sign, authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
  const user = { id: info.lastInsertRowid, name, email, role: 'rep' };
  res.json({ user, token: sign(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password || '', row.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  res.json({ user, token: sign(user) });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

export default router;
