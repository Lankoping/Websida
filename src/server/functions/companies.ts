'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { companies, companyTicketPricing, ticketTypes } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { requireStaffUser } from '../lib/access'
import { writeActivityLog } from './logs'

async function checkAdmin() {
  return await requireStaffUser()
}

export const getCompaniesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(companies).orderBy(companies.name)
})

export const createCompanyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.insert(companies).values(data).returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'company.create',
      entityType: 'company',
      entityId: result[0].id,
      details: { name: result[0].name },
    })
    return result[0]
  })

export const updateCompanyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
        name: z.string().min(1),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const { id, ...updateData } = data
    const result = await db
      .update(companies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'company.update',
      entityType: 'company',
      entityId: id,
      details: { name: result[0].name },
    })
    return result[0]
  })

export const deleteCompanyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    await db.delete(companies).where(eq(companies.id, id))
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'company.delete',
      entityType: 'company',
      entityId: id,
    })
    return { success: true }
  })

export const getCompanyPricingFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: companyId }) => {
    await checkAdmin()
    const db = await getDb()
    return await db
      .select({
        id: companyTicketPricing.id,
        companyId: companyTicketPricing.companyId,
        ticketTypeId: companyTicketPricing.ticketTypeId,
        price: companyTicketPricing.price,
        ticketTypeName: ticketTypes.name,
        ticketTypePrice: ticketTypes.price,
      })
      .from(companyTicketPricing)
      .innerJoin(ticketTypes, eq(companyTicketPricing.ticketTypeId, ticketTypes.id))
      .where(eq(companyTicketPricing.companyId, companyId))
  })

export const upsertCompanyPricingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        companyId: z.number(),
        ticketTypeId: z.number(),
        price: z.number().min(0),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await checkAdmin()
    const db = await getDb()
    const existing = await db
      .select()
      .from(companyTicketPricing)
      .where(
        and(
          eq(companyTicketPricing.companyId, data.companyId),
          eq(companyTicketPricing.ticketTypeId, data.ticketTypeId),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(companyTicketPricing)
        .set({
          price: data.price,
          updatedAt: new Date(),
        })
        .where(eq(companyTicketPricing.id, existing[0].id))
    } else {
      await db.insert(companyTicketPricing).values(data)
    }
    return { success: true }
  })

export const deleteCompanyPricingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    await checkAdmin()
    const db = await getDb()
    await db.delete(companyTicketPricing).where(eq(companyTicketPricing.id, id))
    return { success: true }
  })
