import { createMiddleware } from 'hono/factory'
import * as jwt from 'jsonwebtoken'
import { getPrisma } from '../prisma'

export const protect = createMiddleware<{
  Bindings: { DATABASE_URL: string; JWT_SECRET: string }
  Variables: { user: any }
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, c.env.JWT_SECRET) as any

      const prisma = getPrisma(c.env.DATABASE_URL)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true, role: true }
      })

      if (!user) {
        return c.json({ message: 'User not found' }, 401)
      }

      c.set('user', user)
      await next()
    } catch (error) {
      return c.json({ message: 'Not authorized, token failed' }, 401)
    }
  } else {
    return c.json({ message: 'Not authorized, no token' }, 401)
  }
})
