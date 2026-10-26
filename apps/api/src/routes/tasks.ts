import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.js';

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

tasksRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM tasks WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
      [req.userId]
    );
    return res.json({ tasks: result.rows });
  } catch (error) {
    return next(error);
  }
});

tasksRouter.post('/', async (req: AuthRequest, res, next) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid task data', details: parsed.error.flatten() });
  }
  try {
    const { title, description } = parsed.data;
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, completed, created_at, updated_at`,
      [req.userId, title, description]
    );
    return res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

tasksRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Task ID must be a positive integer' });
  }
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid task update', details: parsed.error.flatten() });
  }

  try {
    const { title, description, completed } = parsed.data;
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           completed = COALESCE($3, completed),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title ?? null, description ?? null, completed ?? null, id, req.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

tasksRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Task ID must be a positive integer' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
