import { router, publicProcedure, protectedProcedure } from './trpc-server'
import { z } from 'zod'
import { db } from './db'
import { hash, verify } from 'argon2'
import { TRPCError } from '@trpc/server'

// Common schemas
const idSchema = z.string().cuid()
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})
const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Auth Router
export const authRouter = router({
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100),
      name: z.string().min(1).max(100).optional(),
    }))
    .mutation(async ({ input }) => {
      const { email, password, name } = input
      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User with this email already exists' })
      }
      const hashedPassword = await hash(password)
      const user = await db.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, createdAt: true },
      })
      return user
    }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})

// Projects Router
const projectInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
})
const bomGroupInputSchema = z.object({
  projectId: idSchema,
  groupType: z.enum(['RESISTOR', 'CAPACITOR', 'INDUCTOR', 'DIODE']),
});
const bomComponentInputSchema = z.object({
  projectId: idSchema,
  parentId: idSchema,
  quantity: z.number().int().min(1),
  lineLabel: z.string().optional(),
  attributes: z.object({
      package: z.string(),
      value: z.string(),
  })
});
const deleteProjectInputSchema = z.object({
  id: idSchema,
  password: z.string(),
});

export const projectsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        pagination: paginationSchema.optional(),
        search: searchSchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { pagination = { page: 1, limit: 20 }, search = {} } = input
      const { page, limit } = pagination
      const { query, sortBy = 'updatedAt', sortOrder = 'desc' } = search

      const skip = (page - 1) * limit

      const where = {
        ownerId: ctx.user.id,
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { tags: { has: query } },
          ],
        }),
      }

      const [projects, total] = await Promise.all([
        db.project.findMany({
          where,
          include: {
            _count: {
              select: {
                bomItems: true,
                files: true,
                bomCommits: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
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

  getById: protectedProcedure
    .input(z.object({ id: idSchema, includeBom: z.boolean().default(true) }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findFirst({
        where: { id: input.id, ownerId: ctx.user.id },
        include: {
          _count: { select: { bomItems: true, files: true, bomCommits: true } },
          bomItems: input.includeBom ? {
            where: { parentId: null },
            include: {
              component: true,
              children: {
                include: { component: true },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          } : undefined,
        },
      })
      if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      return project
    }),

  create: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      return db.project.create({ data: { ...input, ownerId: ctx.user.id } })
    }),

  addBomGroup: protectedProcedure
    .input(bomGroupInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { projectId, groupType } = input;
      const project = await db.project.findFirst({ where: { id: projectId, ownerId: ctx.user.id } });
      if (!project) throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });

      const groupLabels = { RESISTOR: 'Résistances', CAPACITOR: 'Condensateurs', INDUCTOR: 'Inductances', DIODE: 'Diodes' };
      return db.projectBomItem.create({
        data: { projectId, type: 'GROUP', lineLabel: groupLabels[groupType], quantity: 1 },
      });
    }),

  addBomComponentToGroup: protectedProcedure
    .input(bomComponentInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { projectId, parentId, quantity, attributes } = input;
      const parentGroup = await db.projectBomItem.findFirst({ where: { id: parentId, projectId, project: { ownerId: ctx.user.id } } });

      if (!parentGroup || parentGroup.type !== 'GROUP') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' });
      }

      // Auto-create default library for the group type if it doesn't exist
      const defaultLibraryName = `Bibliothèque par Défaut - ${parentGroup.lineLabel}`;
      const defaultLibrary = await db.library.upsert({
        where: { name_ownerId: { name: defaultLibraryName, ownerId: ctx.user.id } },
        update: {},
        create: {
          name: defaultLibraryName,
          description: `Bibliothèque auto-générée pour les ${parentGroup.lineLabel}.`,
          ownerId: ctx.user.id,
        },
      });

      const libraryId = defaultLibrary.id;
      const mpn = `PASSIVE-${attributes.package}-${attributes.value}`;

      const component = await db.component.upsert({
        where: { libraryId_mpn: { libraryId, mpn } },
        update: {},
        create: { libraryId, mpn, footprint: attributes.package, attributes },
      });

      // Check if a BomItem with this component already exists in the group
      const existingBomItem = await db.projectBomItem.findFirst({
        where: {
          projectId,
          parentId,
          componentId: component.id,
          type: 'COMPONENT', // Ensure we're looking for a component, not a group
        },
      });

      if (existingBomItem) {
        // If it exists, increment quantity
        return db.projectBomItem.update({
          where: { id: existingBomItem.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        // If it doesn't exist, create a new one
        return db.projectBomItem.create({
          data: { projectId, parentId, componentId: component.id, quantity, type: 'COMPONENT' },
        });
      }
    }),

  deleteWithPassword: protectedProcedure
    .input(deleteProjectInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, password } = input;
      const user = await db.user.findUnique({ where: { id: ctx.user.id } });
      if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not found' });

      const isPasswordValid = await verify(user.password, password);
      if (!isPasswordValid) throw new TRPCError({ code: 'FORBIDDEN', message: 'Incorrect password' });

      const { count } = await db.project.deleteMany({ where: { id, ownerId: ctx.user.id } });
      if (count === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

      return { success: true };
    }),

  // Delete BOM Item
  deleteBomItem: protectedProcedure
    .input(z.object({
      bomItemId: idSchema,
      projectId: idSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { bomItemId, projectId } = input;

      const bomItem = await db.projectBomItem.findFirst({
        where: {
          id: bomItemId,
          projectId: projectId,
          project: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!bomItem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'BOM item not found or access denied' });
      }

      if (bomItem.type === 'GROUP') {
        const childrenCount = await db.projectBomItem.count({
          where: { parentId: bomItem.id },
        });
        if (childrenCount > 0) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete a group with components. Ungroup first.' });
        }
      }

      await db.projectBomItem.delete({
        where: { id: bomItemId },
      });

      return { success: true };
    }),

  // Delete BOM Item
  deleteBomItem: protectedProcedure
    .input(z.object({
      bomItemId: idSchema,
      projectId: idSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { bomItemId, projectId } = input;

      const bomItem = await db.projectBomItem.findFirst({
        where: {
          id: bomItemId,
          projectId: projectId,
          project: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!bomItem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'BOM item not found or access denied' });
      }

      if (bomItem.type === 'GROUP') {
        const childrenCount = await db.projectBomItem.count({
          where: { parentId: bomItem.id },
        });
        if (childrenCount > 0) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete a group with components. Ungroup first.' });
        }
      }

      await db.projectBomItem.delete({
        where: { id: bomItemId },
      });

      return { success: true };
    }),

  // Delete BOM Item
  deleteBomItem: protectedProcedure
    .input(z.object({
      bomItemId: idSchema,
      projectId: idSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { bomItemId, projectId } = input;

      const bomItem = await db.projectBomItem.findFirst({
        where: {
          id: bomItemId,
          projectId: projectId,
          project: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!bomItem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'BOM item not found or access denied' });
      }

      if (bomItem.type === 'GROUP') {
        const childrenCount = await db.projectBomItem.count({
          where: { parentId: bomItem.id },
        });
        if (childrenCount > 0) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete a group with components. Ungroup first.' });
        }
      }

      await db.projectBomItem.delete({
        where: { id: bomItemId },
      });

      return { success: true };
    }),

  // Remove BOM Group (ungroup)
  removeBomGroup: protectedProcedure
    .input(z.object({
      projectId: idSchema,
      groupId: idSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, groupId } = input;

      const group = await db.projectBomItem.findFirst({
        where: {
          id: groupId,
          projectId: projectId,
          type: 'GROUP',
          project: {
            ownerId: ctx.user.id,
          },
        },
        include: {
          children: {
            select: { id: true },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found or access denied' });
      }

      if (group.children.length > 0) {
        await db.projectBomItem.updateMany({
          where: {
            parentId: group.id,
          },
          data: {
            parentId: null,
          },
        });
      }

      await db.projectBomItem.delete({
        where: {
          id: group.id,
        },
      });

      return { success: true };
    }),

  });

// Libraries Router
const libraryInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const librariesRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    return db.library.findMany({
      where: { ownerId: ctx.user.id },
      include: { _count: { select: { components: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }),

  getComponents: protectedProcedure
    .input(z.object({ libraryId: idSchema, search: searchSchema.optional() }))
    .query(async ({ input, ctx }) => {
      // ... implementation
      return { components: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
    }),

  searchComponents: protectedProcedure
    .input(z.object({ search: searchSchema }))
    .query(async ({ input, ctx }) => {
      // ... implementation
      return { components: [], total: 0 };
    }),

  create: protectedProcedure
    .input(libraryInputSchema)
    .mutation(async ({ input, ctx }) => {
      return db.library.create({ data: { ...input, ownerId: ctx.user.id } });
    }),
});

// Main app router
export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
  libraries: librariesRouter,
})

export type AppRouter = typeof appRouter
