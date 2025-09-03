import { router, protectedProcedure } from '../../../../src/lib/trpc-server'
import { z } from 'zod'
import { db } from '../../../../src/lib/db'

// Common schemas
const idSchema = z.string().cuid()

// Input schemas
const createBomItemSchema = z.object({
  projectId: idSchema,
  componentId: idSchema.optional(),
  lineLabel: z.string().optional(),
  quantity: z.number().min(1),
  unitPriceOverride: z.number().optional(),
  notes: z.string().optional(),
  attributesOverride: z.record(z.string(), z.any()).optional(),
  suppliersOverride: z.array(z.object({
    name: z.string(),
    url: z.string().optional(),
    sku: z.string().optional(),
  })).optional(),
})

const updateBomItemSchema = z.object({
  id: idSchema,
  quantity: z.number().min(1).optional(),
  unitPriceOverride: z.number().optional(),
  notes: z.string().optional(),
  attributesOverride: z.record(z.string(), z.any()).optional(),
  suppliersOverride: z.array(z.object({
    name: z.string(),
    url: z.string().optional(),
    sku: z.string().optional(),
  })).optional(),
})

const importCsvSchema = z.object({
  projectId: idSchema,
  csvData: z.string(),
  mapping: z.record(z.string(), z.string()), // Column mapping
})

export const bomRouter = router({
  // Get BOM items for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: idSchema }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await db.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user.id,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      const bomItems = await db.projectBomItem.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          component: {
            include: {
              library: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return bomItems
    }),

  // Add BOM item
  addItem: protectedProcedure
    .input(createBomItemSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await db.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user.id,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      // If componentId is provided, verify it exists
      if (input.componentId) {
        const component = await db.component.findUnique({
          where: { id: input.componentId },
        })

        if (!component) {
          throw new Error('Component not found')
        }
      }

      const bomItem = await db.projectBomItem.create({
        data: input,
        include: {
          component: {
            include: {
              library: true,
            },
          },
        },
      })

      // Update project timestamp
      await db.project.update({
        where: { id: input.projectId },
        data: { updatedAt: new Date() },
      })

      return bomItem
    }),

  // Update BOM item
  updateItem: protectedProcedure
    .input(updateBomItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify ownership through project
      const bomItem = await db.projectBomItem.findUnique({
        where: { id },
        include: {
          project: true,
        },
      })

      if (!bomItem || bomItem.project.ownerId !== ctx.user.id) {
        throw new Error('BOM item not found')
      }

      const updatedItem = await db.projectBomItem.update({
        where: { id },
        data,
        include: {
          component: {
            include: {
              library: true,
            },
          },
        },
      })

      // Update project timestamp
      await db.project.update({
        where: { id: bomItem.projectId },
        data: { updatedAt: new Date() },
      })

      return updatedItem
    }),

  // Delete BOM item
  deleteItem: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through project
      const bomItem = await db.projectBomItem.findUnique({
        where: { id: input.id },
        include: {
          project: true,
        },
      })

      if (!bomItem || bomItem.project.ownerId !== ctx.user.id) {
        throw new Error('BOM item not found')
      }

      await db.projectBomItem.delete({
        where: { id: input.id },
      })

      // Update project timestamp
      await db.project.update({
        where: { id: bomItem.projectId },
        data: { updatedAt: new Date() },
      })

      return { success: true }
    }),

  // Import CSV
  importCsv: protectedProcedure
    .input(importCsvSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await db.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user.id,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      // Parse CSV data (simplified - would use packages/core/csv in real implementation)
      const lines = input.csvData.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()))

      const bomItems = []

      for (const row of rows) {
        const rowData: any = {}
        headers.forEach((header, index) => {
          const mappedField = input.mapping[header]
          if (mappedField && row[index]) {
            rowData[mappedField] = row[index]
          }
        })

        if (rowData.quantity) {
          const bomItem = await db.projectBomItem.create({
            data: {
              projectId: input.projectId,
              lineLabel: rowData.reference || rowData.lineLabel,
              quantity: parseInt(rowData.quantity) || 1,
              unitPriceOverride: rowData.unitPrice ? parseFloat(rowData.unitPrice) : undefined,
              notes: rowData.notes,
              // For now, create as ad-hoc items without linking to components
              // In a full implementation, we'd try to match against existing components
            },
            include: {
              component: {
                include: {
                  library: true,
                },
              },
            },
          })

          bomItems.push(bomItem)
        }
      }

      // Update project timestamp
      await db.project.update({
        where: { id: input.projectId },
        data: { updatedAt: new Date() },
      })

      return {
        imported: bomItems.length,
        items: bomItems,
      }
    }),

  // Export BOM as CSV
  exportCsv: protectedProcedure
    .input(z.object({ projectId: idSchema }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await db.project.findFirst({
        where: {
          id: input.projectId,
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
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      // Generate CSV headers
      const headers = [
        'Reference',
        'MPN',
        'Footprint',
        'Quantity',
        'Unit Price',
        'Currency',
        'Total Price',
        'Supplier',
        'Notes',
      ]

      // Generate CSV rows
      const rows = project.bomItems.map(item => {
        const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0
        const totalPrice = item.quantity * unitPrice
        const suppliers = item.suppliersOverride || item.component?.suppliers || []
        const mainSupplier = suppliers.length > 0 ? suppliers[0].name : ''

        return [
          item.lineLabel || item.component?.refInternal || '',
          item.component?.mpn || '',
          item.component?.footprint || '',
          item.quantity.toString(),
          unitPrice.toString(),
          item.component?.currency || 'EUR',
          totalPrice.toFixed(2),
          mainSupplier,
          item.notes || '',
        ]
      })

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      return {
        filename: `${project.name}_BOM_${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
      }
    }),

  // Get BOM statistics
  getStats: protectedProcedure
    .input(z.object({ projectId: idSchema }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await db.project.findFirst({
        where: {
          id: input.projectId,
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

      const totalItems = project.bomItems.length
      const totalQuantity = project.bomItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalCost = project.bomItems.reduce((sum, item) => {
        const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0
        return sum + (item.quantity * unitPrice)
      }, 0)

      const componentsWithPrice = project.bomItems.filter(item => {
        const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0
        return unitPrice > 0
      }).length

      const priceCompleteness = totalItems > 0 ? (componentsWithPrice / totalItems) * 100 : 0

      return {
        totalItems,
        totalQuantity,
        totalCost,
        currency: 'EUR',
        priceCompleteness: Math.round(priceCompleteness),
        lastUpdated: project.updatedAt,
      }
    }),
})