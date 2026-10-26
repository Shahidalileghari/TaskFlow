import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default('')
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  completed: z.boolean().optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field to update'
});
