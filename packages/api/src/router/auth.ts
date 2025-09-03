import { router, publicProcedure, protectedProcedure } from '../index'
import { z } from 'zod'
import { db } from '@circuithub/db'
import { hashPassword, validatePassword } from '@circuithub/auth'

export const authRouter = router({
  // Sign up
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password, name } = input

      // Validate password
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`)
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

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

      return { user }
    }),

  // Get current user
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await db.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
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
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input

      // Get user with password
      const user = await db.user.findUnique({
        where: { id: ctx.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        throw new Error('User not found')
      }

      // Verify current password
      const isValidCurrentPassword = await verifyPassword(user.password, currentPassword)
      if (!isValidCurrentPassword) {
        throw new Error('Current password is incorrect')
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`)
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)

      // Update password
      await db.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedNewPassword },
      })

      return { success: true }
    }),
})