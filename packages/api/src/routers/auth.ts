import { router, publicProcedure, protectedProcedure } from '../../../../src/lib/trpc-server'
import { z } from 'zod'
import { db } from '../../../../src/lib/db'
import { hash } from 'argon2'

// Input schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
})



const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
})

export const authRouter = router({
  // Sign up new user
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      const { email, password, name } = input

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const hashedPassword = await hash(password)

      // Create user
      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })

      return user
    }),

  // Get current user
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects: true,
              libraries: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, name } = input

      // If email is being changed, check if it's already taken
      if (email && email !== ctx.user.email) {
        const existingUser = await db.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          throw new Error('Email already in use')
        }
      }

      const updatedUser = await db.user.update({
        where: { id: ctx.user.id },
        data: {
          ...(email && { email }),
          ...(name && { name }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          updatedAt: true,
        },
      })

      return updatedUser
    }),

  // Change password
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input

      // Get current user with password
      const user = await db.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const { verify } = await import('argon2')
      const isValidPassword = await verify(user.password, currentPassword)

      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await hash(newPassword)

      // Update password
      await db.user.update({
        where: { id: ctx.user.id },
        data: {
          password: hashedNewPassword,
        },
      })

      return { success: true }
    }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(z.object({
      password: z.string(),
      confirmation: z.literal('DELETE_MY_ACCOUNT'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { password } = input

      // Get current user with password
      const user = await db.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify password
      const { verify } = await import('argon2')
      const isValidPassword = await verify(user.password, password)

      if (!isValidPassword) {
        throw new Error('Password is incorrect')
      }

      // Delete user (cascade will handle related data)
      await db.user.delete({
        where: { id: ctx.user.id },
      })

      return { success: true }
    }),

  // Get user statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [projectCount, libraryCount, componentCount, bomItemCount] = await Promise.all([
        db.project.count({
          where: { ownerId: ctx.user.id },
        }),
        db.library.count({
          where: { ownerId: ctx.user.id },
        }),
        db.component.count({
          where: {
            library: {
              ownerId: ctx.user.id,
            },
          },
        }),
        db.projectBomItem.count({
          where: {
            project: {
              ownerId: ctx.user.id,
            },
          },
        }),
      ])

      // Get recent activity
      const recentProjects = await db.project.findMany({
        where: { ownerId: ctx.user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      })

      return {
        projectCount,
        libraryCount,
        componentCount,
        bomItemCount,
        recentProjects,
      }
    }),
})