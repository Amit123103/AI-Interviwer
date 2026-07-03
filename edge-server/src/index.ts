import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', secureHeaders())

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: [
      'http://localhost:3000',
      'https://intervyxa-ai.vercel.app',
      'https://intervyxa-ai-git-main.vercel.app',
    ],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Request Logger
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`[${c.req.method}] ${c.req.url} - ${c.res.status} - ${ms}ms`)
})

app.get('/', (c) => {
  return c.text('Intervyxa AI API (Edge) is running…')
})

app.get('/api/system/health', (c) => {
  return c.json({
    server: 'online',
    edge: true,
    timestamp: new Date().toISOString(),
  })
})

import auth from './routes/auth'
import profile from './routes/profile'

app.route('/api/auth', auth)
app.route('/api/profile', profile)

export default app
