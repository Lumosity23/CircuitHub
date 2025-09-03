import { initTRPC, TRPCError } from '@trpc/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-config'
import superjson from 'superjson'
import type { NextRequest } from 'next/server'

// Context type
export interface Context {
  user?: {
    id: string
    email: string
    name?: string
  }
  req?: NextRequest
}

// Create context function
export async function createTRPCContext(opts: { req?: Request | NextRequest }): Promise<Context> {
  const session = await getServerSession(authOptions)
  
  return {
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
    } : undefined,
    req: opts.req as NextRequest,
  }
}

// Create tRPC instance
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error('tRPC Error:', error)
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
      },
    }
  },
})

// Export router and procedures
export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure with proper error handling
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})