import { Hono } from 'hono'
import { getPrisma } from '../prisma'
import { protect } from '../middleware/auth'

const profile = new Hono<{
  Bindings: { DATABASE_URL: string; JWT_SECRET: string }
  Variables: { user: any }
}>()

profile.use('*', protect)

profile.post('/', async (c) => {
  const user = c.get('user')
  const prisma = getPrisma(c.env.DATABASE_URL)

  try {
    const body = await c.req.parseBody()
    const fullName = body['fullName'] as string | undefined
    const course = body['course'] as string | undefined
    const department = body['department'] as string | undefined
    const dreamCompany = body['dreamCompany'] as string | undefined
    const bio = body['bio'] as string | undefined
    const resume = body['resume'] as File | undefined

    const profileFields: any = {}
    if (fullName) profileFields.fullName = fullName
    if (course) profileFields.course = course
    if (department) profileFields.department = department
    if (dreamCompany) profileFields.dreamCompany = dreamCompany
    if (bio) profileFields.bio = bio

    if (resume) {
      // Phase 2: Upload to Cloudflare R2 and parse with Workers AI
      // For now, we skip local fs upload since workers don't have fs access
      console.log('Resume received:', resume.name)
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileFields,
      create: {
        ...profileFields,
        userId: user.id
      }
    })

    return c.json(updatedProfile)
  } catch (error: any) {
    console.error("Profile Controller Error:", error.message)
    return c.json({ message: 'Server error', details: error.message }, 500)
  }
})

profile.get('/', async (c) => {
  const user = c.get('user')
  const prisma = getPrisma(c.env.DATABASE_URL)

  try {
    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            email: true,
            username: true
          }
        }
      }
    })

    if (!userProfile) {
      return c.json({ message: 'Profile not found' }, 404)
    }

    return c.json(userProfile)
  } catch (error: any) {
    console.error("Get Profile Error:", error)
    return c.json({ message: 'Server error' }, 500)
  }
})

export default profile
