import { prisma } from '../db.js'
try {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  console.log(JSON.stringify({ tables: tables.map(table => table.tablename) }))
} catch (error) {
  console.error('Connexion impossible : ' + (error instanceof Error ? error.name : 'erreur inconnue'))
  process.exitCode = 1
} finally { await prisma.$disconnect() }
