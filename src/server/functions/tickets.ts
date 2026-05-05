
"use server"
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import {
  tickets,
  events,
  ticketTypes,
  eventTicketTypes,
  companies,
  companyTicketPricing,
  users,
} from '../db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { requireStaffUser } from '../lib/access'
import { writeActivityLog } from './logs'

async function checkAdmin() {
  return await requireStaffUser()
}

function generateTicketCode() {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'TK-'
  for (let i = 0; i < 8; i++) code += charset[Math.floor(Math.random() * charset.length)]
  return code
}

export const getEventsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(events).orderBy(events.date)
})

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().optional(),
        date: z.string(),
        location: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean().optional(),
        finished: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.insert(events).values(data).returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.create',
      entityType: 'event',
      entityId: result[0].id,
      details: { title: result[0].title },
    })
    return result[0]
  })

export const updateEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        date: z.string(),
        location: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean().optional(),
        finished: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const { id, ...rest } = data
    const result = await db
      .update(events)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.update',
      entityType: 'event',
      entityId: id,
      details: { title: result[0].title },
    })
    return result[0]
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    await checkAdmin()
    const db = await getDb()
    await db.delete(events).where(eq(events.id, id))
    return { success: true }
  })

export const updateEventStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ eventId: z.number(), finished: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    await checkAdmin()
    const db = await getDb()
    await db.update(events).set({ finished: data.finished, updatedAt: new Date() }).where(eq(events.id, data.eventId))
    return { success: true }
  })

export const getTicketTypesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(ticketTypes).orderBy(ticketTypes.name)
})

export const createTicketTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().min(1), price: z.number().min(0), description: z.string().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    await checkAdmin()
    const db = await getDb()
    const result = await db.insert(ticketTypes).values(data).returning()
    return result[0]
  })

export const deleteTicketTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    await checkAdmin()
    const db = await getDb()
    await db.delete(ticketTypes).where(eq(ticketTypes.id, id))
    return { success: true }
  })

export const getTicketTypesForEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: eventId }) => {
    await checkAdmin()
    const db = await getDb()

    const tts = await db
      .select({ ticketTypeId: eventTicketTypes.ticketTypeId, enabled: eventTicketTypes.enabled, maxQuantity: eventTicketTypes.maxQuantity, name: ticketTypes.name, price: ticketTypes.price })
      .from(eventTicketTypes)
      .innerJoin(ticketTypes, eq(eventTicketTypes.ticketTypeId, ticketTypes.id))
      .where(eq(eventTicketTypes.eventId, eventId))

    const allCompanies = await db.select().from(companies).orderBy(companies.name)

    // pricing rules for ticket types present for this event
    const ticketTypeIds = tts.map((t: any) => t.ticketTypeId)
    const pricingRules = ticketTypeIds.length
      ? await db.select().from(companyTicketPricing).where(inArray(companyTicketPricing.ticketTypeId, ticketTypeIds))
      : []

    return { ticketTypes: tts, companies: allCompanies, pricingRules }
  })

export const issueTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventId: z.number(),
        participantName: z.string().min(1),
        participantEmail: z.string().email(),
        ticketType: z.string().min(1),
        pricePaid: z.number().min(0),
        ticketCount: z.number().min(1).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const count = data.ticketCount || 1
    const created: any[] = []
    for (let i = 0; i < count; i++) {
      const code = generateTicketCode()
      const result = await db.insert(tickets).values({
        eventId: data.eventId,
        participantName: data.participantName,
        participantEmail: data.participantEmail,
        ticketType: data.ticketType,
        pricePaid: data.pricePaid,
        ticketCode: code,
        issuedBy: admin.id,
      }).returning()
      created.push(result[0])
    }
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.issue',
      entityType: 'ticket',
      entityId: created[0].id,
      details: { count: created.length },
    })
    return { ticketCode: created[0].ticketCode }
  })

export const getEventsForTicketsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select({ id: events.id, title: events.title, date: events.date }).from(events).orderBy(events.date)
})

export const getTicketsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(tickets).orderBy(tickets.createdAt.desc)
})

export const getTicketSummaryFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  const all = await db.select().from(tickets)
  const total = all.length
  const active = all.filter((t: any) => t.status === 'valid').length
  const used = all.filter((t: any) => t.status === 'used').length
  return { totalTickets: total, activeTickets: active, usedTickets: used }
})

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    await checkAdmin()
    const db = await getDb()
    await db.delete(tickets).where(eq(tickets.id, id))
    return { success: true }
  })

export const updateTicketStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ ticketId: z.number(), status: z.enum(['valid', 'used', 'cancelled']) }).parse(data))
  .handler(async ({ data }) => {
    await checkAdmin()
    const db = await getDb()
    await db.update(tickets).set({ status: data.status, updatedAt: new Date() }).where(eq(tickets.id, data.ticketId))
    return { success: true }
  })

export const verifyTicketByCodeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ code: z.string().min(1), markAsUsed: z.boolean().optional() }).parse(data))
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const found = await db.select().from(tickets).where(eq(tickets.ticketCode, data.code)).limit(1)
    if (!found[0]) throw new Error('Biljett hittades inte')
    const ticket = found[0]
    if (data.markAsUsed) {
      await db.update(tickets).set({ status: 'used', scannedAt: new Date(), scannedBy: admin.id }).where(eq(tickets.id, ticket.id))
    }
    return { ...ticket }
  })

export const resendTicketEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ ticketId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    await checkAdmin()
    // In this environment we don't actually send email; just simulate success
    return { success: true }
  })

