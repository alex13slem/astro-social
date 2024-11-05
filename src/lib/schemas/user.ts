import { z } from 'astro/zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  user_id: z.string(),
});
