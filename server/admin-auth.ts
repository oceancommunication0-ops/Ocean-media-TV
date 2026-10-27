import type { Request, RequestHandler, Response } from 'express'
import { argon2, createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { prisma } from './db.js'
import { config } from './config.js'

const COOKIE_NAME = 'ocean_admin_session'
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000
const ARGON2_OPTIONS = { memory: 19 * 1024, passes: 2, parallelism: 1, tagLength: 32 }
const HASH_BYTES = ARGON2_OPTIONS.tagLength

const username = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,49}$/, 'Utilisez 3 à 50 lettres minuscules, chiffres, points, tirets ou underscores.')
const email = z.email().trim().toLowerCase().max(254)
const displayName = z.string().trim().min(2).max(120)
const password = z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères.').max(128)
export const loginSchema = z.strictObject({ identifier: z.string().trim().min(3).max(254), password })
export const adminCreateSchema = z.strictObject({ username, email, displayName, password })
export const adminUpdateSchema = z.strictObject({
  username: username.optional(), email: email.optional(), displayName: displayName.optional(),
  password: password.optional(), active: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, 'Aucune modification transmise.')

interface SessionUser {
  id: string; username: string; email: string; displayName: string; active: boolean
  lastLoginAt: Date | null; createdAt: Date; updatedAt: Date
}
interface AdminAuthContext { kind: 'session' | 'api-key'; user: SessionUser | null; sessionId?: string; csrfHash?: string }

function sha256(value: string) { return createHash('sha256').update(value).digest('hex') }
function safeEqualText(left: string, right: string) {
  const a = createHash('sha256').update(left).digest()
  const b = createHash('sha256').update(right).digest()
  return timingSafeEqual(a, b)
}
function derive(passwordValue: string, salt: Buffer, options = ARGON2_OPTIONS) {
  return new Promise<Buffer>((resolve, reject) => argon2('argon2id', { message: passwordValue, nonce: salt, ...options }, (error, key) => error ? reject(error) : resolve(key)))
}
export async function hashAdminPassword(passwordValue: string) {
  const salt = randomBytes(24)
  const derived = await derive(passwordValue, salt)
  return `argon2id$${ARGON2_OPTIONS.memory}$${ARGON2_OPTIONS.passes}$${ARGON2_OPTIONS.parallelism}$${salt.toString('base64url')}$${derived.toString('base64url')}`
}
export async function verifyAdminPassword(passwordValue: string, encoded: string) {
  const [algorithm, memory, passes, parallelism, saltValue, hashValue] = encoded.split('$')
  if (algorithm !== 'argon2id' || !memory || !passes || !parallelism || !saltValue || !hashValue) return false
  const expected = Buffer.from(hashValue, 'base64url')
  if (expected.length !== HASH_BYTES) return false
  const derived = await derive(passwordValue, Buffer.from(saltValue, 'base64url'), { memory: Number(memory), passes: Number(passes), parallelism: Number(parallelism), tagLength: expected.length })
  return timingSafeEqual(expected, derived)
}
const dummyHash = hashAdminPassword(randomBytes(32).toString('base64url'))

export function publicAdminUser(user: SessionUser) {
  return { id: user.id, username: user.username, email: user.email, displayName: user.displayName, active: user.active, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt, updatedAt: user.updatedAt }
}
function cookies(request: Request) {
  return Object.fromEntries((request.headers.cookie ?? '').split(';').map(item => item.trim()).filter(Boolean).map(item => {
    const separator = item.indexOf('=')
    return separator < 0 ? [item, ''] : [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))]
  }))
}
function setSessionCookie(response: Response, value: string) {
  response.cookie(COOKIE_NAME, value, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'strict', path: '/api/admin', maxAge: SESSION_DURATION_MS })
}
export function clearSessionCookie(response: Response) {
  response.clearCookie(COOKIE_NAME, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'strict', path: '/api/admin' })
}
function requestIpHash(request: Request) { return request.ip ? sha256(request.ip) : null }

export async function createAdminSession(request: Request, response: Response, adminUserId: string) {
  const id = randomBytes(16).toString('base64url')
  const verifier = randomBytes(32).toString('base64url')
  const csrfToken = randomBytes(32).toString('base64url')
  await prisma.adminSession.create({ data: {
    id, verifierHash: sha256(verifier), csrfHash: sha256(csrfToken), adminUserId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS), userAgent: request.get('user-agent')?.slice(0, 500), ipHash: requestIpHash(request),
  } })
  setSessionCookie(response, `${id}.${verifier}`)
  return csrfToken
}

export function getAdminAuth(response: Response) { return response.locals.adminAuth as AdminAuthContext | undefined }

export const authenticateAdmin: RequestHandler = async (request, response, next) => {
  response.setHeader('Cache-Control', 'no-store')
  const bearer = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (config.ADMIN_API_KEY && bearer && safeEqualText(bearer, config.ADMIN_API_KEY)) {
    response.locals.adminAuth = { kind: 'api-key', user: null }
    next(); return
  }
  const value = cookies(request)[COOKIE_NAME]
  const [sessionId, verifier] = value?.split('.') ?? []
  if (!sessionId || !verifier) { clearSessionCookie(response); response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' } }); return }
  const session = await prisma.adminSession.findUnique({ where: { id: sessionId }, include: { adminUser: true } })
  if (!session || session.expiresAt <= new Date() || !session.adminUser.active || !safeEqualText(sha256(verifier), session.verifierHash)) {
    if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined)
    clearSessionCookie(response); response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Votre session a expiré. Reconnectez-vous.' } }); return
  }
  response.locals.adminAuth = { kind: 'session', user: session.adminUser, sessionId: session.id, csrfHash: session.csrfHash }
  next()
}

export const requireAdminCsrf: RequestHandler = (request, response, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) { next(); return }
  const auth = getAdminAuth(response)
  if (auth?.kind === 'api-key') { next(); return }
  const token = request.get('x-csrf-token') ?? ''
  if (!auth?.csrfHash || !token || !safeEqualText(sha256(token), auth.csrfHash)) {
    response.status(403).json({ error: { code: 'INVALID_CSRF', message: 'La session de sécurité doit être actualisée.' } }); return
  }
  next()
}


export async function consumeInvalidLoginPassword(passwordValue: string) { await verifyAdminPassword(passwordValue, await dummyHash) }
export function normalizeAdminIdentifier(value: string) { return value.trim().toLowerCase() }
export function hashCsrf(value: string) { return sha256(value) }
export function newCsrfToken() { return randomBytes(32).toString('base64url') }
