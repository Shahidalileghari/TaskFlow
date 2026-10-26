import { describe, expect, it } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '../src/schemas/task.js';
import { loginSchema, registerSchema } from '../src/schemas/auth.js';

describe('registration validation', () => {
  it('normalizes email to lowercase', () => {
    const result = registerSchema.parse({
      name: 'Ada Lovelace',
      email: 'ADA@EXAMPLE.COM',
      password: 'a-long-enough-password'
    });
    expect(result.email).toBe('ada@example.com');
  });

  it('rejects short passwords', () => {
    expect(registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'short'
    }).success).toBe(false);
  });

  it('rejects invalid login email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });
});

describe('task validation', () => {
  it('trims title and defaults description', () => {
    expect(createTaskSchema.parse({ title: '  Ship feature  ' })).toMatchObject({
      title: 'Ship feature',
      description: ''
    });
  });

  it('rejects empty updates', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a completion-only update', () => {
    expect(updateTaskSchema.parse({ completed: true })).toEqual({ completed: true });
  });
});
