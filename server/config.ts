import 'dotenv/config'
import { z } from 'zod'
const settings = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('127.0.0.1'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://127.0.0.1:5173,http://localhost:5173'),
  ADMIN_API_KEY: z.string().min(32).optional(),
  TRUST_PROXY: z.enum(['0', '1']).default('0'),
})
const parsed = settings.safeParse(process.env)
if (!parsed.success) throw new Error('Configuration serveur invalide : ' + parsed.error.issues.map(issue => issue.path.join('.')).join(', '))
export const config = parsed.data

