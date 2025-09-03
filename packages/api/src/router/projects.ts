import { router, publicProcedure, protectedProcedure, idSchema, paginationSchema, searchSchema } from '../index'
import { z } from 'zod'
import { db } from '@circuithub/db'

const projectInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

const projectUpdateSchema = projectInputSchema.partial()

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

export const projectsRouter = router({
  // List projects (for current user)
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
      const { query, sortBy = 'createdAt', sortOrder = 'desc' } = search

      const skip = (page - 1) * limit

      // Build where clause
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

      // Get projects with pagination
      const [projects, total] = await Promise.all([
        db.project.findMany({
          where,
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
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

  // Get single project
  getById: protectedProcedure
    .input(
      z.object({
        id: idSchema,
        includeBom: z.boolean().default(false),
        includeFiles: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id, includeBom, includeFiles } = input

      const project = await db.project.findFirst({
        where: {
          id,
          ownerId: ctx.user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          ...(includeBom && {
            bomItems: {
              where: { parentId: null }, // Only fetch top-level items
              include: {
                component: true,
                children: { // Recursively fetch children
                  include: {
                    component: true,
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          }),
          ...(includeFiles && {
            files: {
              orderBy: { createdAt: 'desc' },
            },
          }),
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
        throw new Error('Project not found or access denied')
      }

      return project
    }),

  // Create project
  create: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ input, ctx }) => {
      const project = await db.project.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return project
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: idSchema,
        data: projectUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input

      const project = await db.project.updateMany({
        where: {
          id,
          ownerId: ctx.user.id,
        },
        data,
      })

      if (project.count === 0) {
        throw new Error('Project not found or access denied')
      }

      return db.project.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const project = await db.project.deleteMany({
        where: {
          id,
          ownerId: ctx.user.id,
        },
      })

      if (project.count === 0) {
        throw new Error('Project not found or access denied')
      }

      return { success: true }
    }),

  // Delete project with password confirmation
  deleteWithPassword: protectedProcedure
    .input(deleteProjectInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, password } = input;
      const user = await db.user.findUnique({ where: { id: ctx.user.id } });

      if (!user) {
        throw new Error('Utilisateur non trouvé.');
      }

      // This is a placeholder for password verification. 
      // In a real app, use a secure password hashing and comparison library like argon2 or bcrypt.
      // For this example, we'll assume a plain text password for simplicity, which is NOT secure.
      const isPasswordValid = password === user.password; // DO NOT DO THIS IN PRODUCTION

      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect.');
      }

      const project = await db.project.deleteMany({
        where: {
          id,
          ownerId: ctx.user.id,
        },
      });

      if (project.count === 0) {
        throw new Error('Projet non trouvé ou accès refusé.');
      }

      return { success: true };
    }),

  // Add BOM Group
  addBomGroup: protectedProcedure
    .input(bomGroupInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { projectId, groupType } = input;

      const project = await db.project.findFirst({
        where: {
          id: projectId,
          ownerId: ctx.user.id,
        },
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const groupLabels = {
        RESISTOR: 'Résistances',
        CAPACITOR: 'Condensateurs',
        INDUCTOR: 'Inductances',
        DIODE: 'Diodes',
      };

      const bomGroup = await db.projectBomItem.create({
        data: {
          projectId,
          type: 'GROUP',
          lineLabel: groupLabels[groupType],
        },
      });

      return bomGroup;
    }),

  // Add Component to BOM Group
  addBomComponentToGroup: protectedProcedure
    .input(bomComponentInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { projectId, parentId, quantity, lineLabel, attributes } = input;

      const parentGroup = await db.projectBomItem.findFirst({
        where: {
          id: parentId,
          projectId: projectId,
          project: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!parentGroup || parentGroup.type !== 'GROUP') {
        throw new Error('Group not found or access denied');
      }
      
      const userLibraries = await db.library.findMany({ where: { ownerId: ctx.user.id } });
      if (userLibraries.length === 0) {
        throw new Error("Veuillez créer une bibliothèque de composants d'abord.");
      }
      const libraryId = userLibraries[0].id; // Use the first library found

      const mpn = `PASSIVE-${attributes.package}-${attributes.value}`;

      const component = await db.component.upsert({
        where: { libraryId_mpn: { libraryId, mpn } },
        update: {},
        create: {
          libraryId,
          mpn,
          footprint: attributes.package,
          attributes: attributes as any,
        },
      });

      const bomItem = await db.projectBomItem.create({
        data: {
          projectId,
          parentId,
          componentId: component.id,
          quantity,
          lineLabel,
          type: 'COMPONENT',
        },
      });

      return bomItem;
    }),
})