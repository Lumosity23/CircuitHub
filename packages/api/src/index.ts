import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import superjson from 'superjson'

// Context type
export interface Context {
  user?: {
    id: string
    email: string
    name?: string
  }
}

// Create tRPC instance
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error formatting here
      },
    }
  },
})

// Export router and procedures
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Unauthorized')
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Common Zod schemas
export const idSchema = z.string().cuid()

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>

// Import routers
import { authRouter } from './routers/auth'
import { projectsRouter } from './routers/projects'
import { bomRouter } from './routers/bom'
import { librariesRouter } from './routers/libraries'

// Main app router
export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
  bom: bomRouter,
  libraries: librariesRouter,
})

export type AppRouter = typeof appRouter