try {
  process.loadEnvFile?.();
} catch (_) {}
import { z } from 'zod';


export const env = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().optional().default(''),
    JWT_SECRET: z.string().min(32).default('production_grade_placement_screening_jwt_secret_key_2026_secure'),
    FRONTEND_ORIGIN: z.string().optional().default(''),
    ADMIN_EMAIL: z.string().email().default('admin.placementscollege@gmail.com'),
    ADMIN_PASSWORD: z.string().min(1).default('admin'),
    GMAIL_USER: z.string().optional().default('admin.placementscollege@gmail.com'),
    GMAIL_APP_PASSWORD: z.string().optional().default('hvjzexohouykzqkb'),
  })
  .parse(process.env);

