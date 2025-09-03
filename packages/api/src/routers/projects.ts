import { router, protectedProcedure } from '../../../../src/lib/trpc-server'
import { z } from 'zod'
import { db } from '../../../../src/lib/db'

// Common schemas
const idSchema = z.string().cuid()
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})
const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Input schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

const updateProjectSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const projectsRouter = router({
  // List projects with pagination and search
  list: protectedProcedure
    .input(paginationSchema.extend({
      query: z.string().optional(),
      sortBy: z.string().default('updatedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, query, sortBy = 'updatedAt', sortOrder } = input
      const skip = (page - 1) * limit

      const where = query
        ? {
            ownerId: ctx.user.id,
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { description: { contains: query, mode: 'insensitive' as const } },
              { tags: { has: query } },
            ],
          }
        : { ownerId: ctx.user.id }

      const [projects, total] = await Promise.all([
        db.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: {
                bomItems: true,
                files: true,
                bomCommits: true,
              },
            },
          },
        }),
        db.project.count({ where }),
      ])

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: idSchema }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        include: {
          bomItems: {
            include: {
              component: {
                include: {
                  library: true,
                },
              },
            },
          },
          files: true,
          bomCommits: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              bomItems: true,
              files: true,
              bomCommits: true,
            },
          },
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      return project
    }),

  // Create new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
        include: {
          _count: {
            select: {
              bomItems: true,
              files: true,
              bomCommits: true,
            },
          },
        },
      })

      return project
    }),

  // Update project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const project = await db.project.findFirst({
        where: {
          id,
          ownerId: ctx.user.id,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      const updatedProject = await db.project.update({
        where: { id },
        data,
        include: {
          _count: {
            select: {
              bomItems: true,
              files: true,
              bomCommits: true,
            },
          },
        },
      })

      return updatedProject
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      await db.project.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get project stats
  getStats: protectedProcedure
    .input(z.object({ id: idSchema }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        include: {
          bomItems: {
            include: {
              component: true,
            },
          },
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      // Calculate total cost
      const totalCost = project.bomItems.reduce((sum: number, item: any) => {
        const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0
        return sum + (item.quantity * Number(unitPrice))
      }, 0)

      // Count unique components
      const uniqueComponents = new Set(
        project.bomItems
          .filter((item: any) => item.component)
          .map((item: any) => item.component!.id)
      ).size

      return {
        totalComponents: project.bomItems.length,
        uniqueComponents,
        totalCost,
        currency: 'EUR', // Default currency
        lastUpdated: project.updatedAt,
      }
    }),
})