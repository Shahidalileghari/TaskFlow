import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid registration data', details: parsed.error.flatten() });
  }

  try {
    const { name, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );
    const user = result.rows[0] as { id: string; name: string; email: string; created_at: string };
    const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: '2h' });
    return res.status(201).json({ token, user });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    return next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid login data', details: parsed.error.flatten() });
  }

  try {
    const { email, password } = parsed.data;
    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0] as {
      id: string; name: string; email: string; password_hash: string; created_at: string
    } | undefined;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: '2h' });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
    });
  } catch (error) {
    return next(error);
  }
});
