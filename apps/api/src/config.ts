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
    ADMIN_EMAIL: z.string().email().default('admin@placement.edu'),
    ADMIN_PASSWORD: z.string().min(8).default('Admin@Placement2026!'),
  })
  .parse(process.env);

