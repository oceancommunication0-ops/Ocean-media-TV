import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'
import { config } from './config.js'
const connectionUrl = new URL(config.DATABASE_URL)
// Preserve full certificate verification explicitly with current and future pg releases.
if (connectionUrl.searchParams.get('sslmode') === 'require') connectionUrl.searchParams.set('sslmode', 'verify-full')
const adapter = new PrismaPg({ connectionString: connectionUrl.toString(), max: 5, connectionTimeoutMillis: 15_000, idleTimeoutMillis: 30_000, statement_timeout: 15_000 })
export const prisma = new PrismaClient({ adapter, transactionOptions: { maxWait: 20_000, timeout: 20_000 } })

