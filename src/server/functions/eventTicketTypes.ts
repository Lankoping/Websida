'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { eventTicketTypes, ticketTypes } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { requireStaffUser } from '../lib/access'

async function checkAdmin() {
  return await requireStaffUser()
}

export const getAllTicketTypesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(ticketTypes).orderBy(ticketTypes.name)
})

export const getAllEventTicketTypesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db
    .select({
      id: eventTicketTypes.id,
      eventId: eventTicketTypes.eventId,
      ticketTypeId: eventTicketTypes.ticketTypeId,
      maxQuantity: eventTicketTypes.maxQuantity,
      enabled: eventTicketTypes.enabled,
      ticketTypeName: ticketTypes.name,
      ticketTypePrice: ticketTypes.price,
    })
    .from(eventTicketTypes)
    .innerJoin(ticketTypes, eq(eventTicketTypes.ticketTypeId, ticketTypes.id))
})

// Public endpoint: ticket types and their standard prices (no admin required)
export const getPublicTicketTypesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return await db.select({ id: ticketTypes.id, name: ticketTypes.name, price: ticketTypes.price }).from(ticketTypes).orderBy(ticketTypes.price)
})

export const setEventTicketTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventId: z.number(),
        ticketTypeId: z.number(),
        enabled: z.boolean(),
        maxQuantity: z.number().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await checkAdmin()
    const db = await getDb()
    const existing = await db
      .select()
      .from(eventTicketTypes)
      .where(and(eq(eventTicketTypes.eventId, data.eventId), eq(eventTicketTypes.ticketTypeId, data.ticketTypeId)))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(eventTicketTypes)
        .set({ enabled: data.enabled, maxQuantity: data.maxQuantity, updatedAt: new Date() })
        .where(eq(eventTicketTypes.id, existing[0].id))
    } else {
      await db.insert(eventTicketTypes).values({
        eventId: data.eventId,
        ticketTypeId: data.ticketTypeId,
        enabled: data.enabled,
        maxQuantity: data.maxQuantity,
      })
    }
    return { success: true }
  })
