import { Hono } from 'hono'
import { getPrisma } from '../prisma'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { z } from 'zod'

const auth = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string } }>()

const ADMIN_USERNAME = 'Administrator'
const ADMIN_PASSWORD = 'Admin@2026Secure!'
const ADMIN_JWT_SECRET = 'admin_nexus_secret_2026'

const generateToken = (id: string, role: string, secret: string) => {
  return jwt.sign({ id, role }, secret, { expiresIn: '30d' })
}

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const { username, email, password } = body

  if (!username || !email || !password) {
    return c.json({ message: 'Please provide all required fields' }, 400)
  }

  try {
    const prisma = getPrisma(c.env.DATABASE_URL)
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.trim()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername }
        ]
      }
    })

    if (existingUser) {
      return c.json({ message: 'User already exists' }, 400)
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        profile: { create: {} },
        preferences: { create: {} }
      },
      include: { preferences: true }
    })

    return c.json({
      _id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role.toLowerCase(),
      token: generateToken(newUser.id, newUser.role, c.env.JWT_SECRET),
      preferences: newUser.preferences || { theme: 'dark', language: 'English' },
      twoFactorEnabled: newUser.twoFactorEnabled || false
    }, 201)
  } catch (error: any) {
    return c.json({ message: error.message || 'Server error' }, 500)
  }
})

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const { identifier, password } = body

  if (!identifier || !password) {
    return c.json({ message: 'Email/Username and password are required' }, 400)
  }

  try {
    const prisma = getPrisma(c.env.DATABASE_URL)
    const sanitizedIdentifier = identifier.trim()
    const lowerEmail = sanitizedIdentifier.toLowerCase()

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lowerEmail },
          { username: { equals: sanitizedIdentifier, mode: 'insensitive' } }
        ]
      },
      include: { preferences: true }
    })

    if (!user) {
      return c.json({ message: 'Invalid email/username or password' }, 401)
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      return c.json({ message: 'Invalid email/username or password' }, 401)
    }

    if (user.accountStatus === 'SUSPENDED') {
      return c.json({ message: 'Your account has been suspended. Please contact support.' }, 403)
    }

    // Attempt to log the login (fire and forget)
    c.executionCtx.waitUntil(
      prisma.loginLog.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: c.req.header('cf-connecting-ip') || 'unknown',
          userAgent: c.req.header('user-agent') || 'unknown',
        }
      })
    )

    return c.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.toLowerCase(),
      token: generateToken(user.id, user.role, c.env.JWT_SECRET),
      preferences: user.preferences || { theme: 'dark', language: 'English' },
      twoFactorEnabled: user.twoFactorEnabled || false
    })
  } catch (error: any) {
    return c.json({ message: 'Server error during login', error: error.message }, 500)
  }
})

auth.post('/admin-login', async (c) => {
  const body = await c.req.json()
  const { username, password } = body

  if (!username || !password) {
    return c.json({ message: 'Username and password are required' }, 400)
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return c.json({ message: 'Invalid administrator credentials' }, 401)
  }

  const token = jwt.sign(
    { role: 'administrator', username: ADMIN_USERNAME, isSystemAdmin: true },
    ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  )

  return c.json({
    token,
    username: ADMIN_USERNAME,
    role: 'administrator',
    message: 'Administrator access granted'
  })
})

export default auth
