import { router, protectedProcedure, idSchema, paginationSchema, searchSchema } from '../index'
import { z } from 'zod'
import { db } from '@circuithub/db'

const libraryInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const librariesRouter = router({
  // List libraries for the current user
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const libraries = await db.library.findMany({
        where: {
          ownerId: ctx.user.id,
        },
        include: {
          _count: {
            select: { components: true },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      return libraries;
    }),

  // Get components for a single library
  getComponents: protectedProcedure
    .input(
      z.object({
        libraryId: idSchema,
        pagination: paginationSchema.optional(),
        search: searchSchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { libraryId, pagination = { page: 1, limit: 20 }, search = {} } = input;
      const { page, limit } = pagination;
      const { query, sortBy = 'mpn', sortOrder = 'asc' } = search;

      const library = await db.library.findFirst({
        where: { id: libraryId, ownerId: ctx.user.id },
      });

      if (!library) {
        throw new Error('Library not found or access denied');
      }

      const skip = (page - 1) * limit;

      const where = {
        libraryId,
        ...(query && {
          OR: [
            { mpn: { contains: query, mode: 'insensitive' as const } },
            { refInternal: { contains: query, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [components, total] = await Promise.all([
        db.component.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        db.component.count({ where }),
      ]);

      return {
        components,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),
  
  // Search components across all user libraries
  searchComponents: protectedProcedure
    .input(
      z.object({
        search: searchSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { search } = input;
      const { query, sortBy = 'mpn', sortOrder = 'asc', limit = 50 } = search;

      if (!query) {
        return { components: [], total: 0 };
      }

      const where = {
        library: {
          ownerId: ctx.user.id,
        },
        OR: [
          { mpn: { contains: query, mode: 'insensitive' as const } },
          { refInternal: { contains: query, mode: 'insensitive' as const } },
        ],
      };

      const [components, total] = await Promise.all([
        db.component.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          include: { library: { select: { name: true } } },
        }),
        db.component.count({ where }),
      ]);

      return { components, total };
    }),

  // Create a new library
  create: protectedProcedure
    .input(libraryInputSchema)
    .mutation(async ({ input, ctx }) => {
      const library = await db.library.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      });
      return library;
    }),
});