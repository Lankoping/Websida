'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { tickets, events, ticketTypes } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrganizerUser } from '../lib/access'
import { writeActivityLog } from './logs'
import { randomBytes } from 'node:crypto'
import { sendEmail } from '../lib/email'

export const getTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb()
    return await db.select().from(tickets)
  })

export const getEventsForTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb()
    return await db.select().from(events)
  })

export const getTicketTypesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb()
    return await db.select().from(ticketTypes)
  })

export const issueTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      eventId: z.number(),
      participantName: z.string(),
      participantEmail: z.string().email(),
      ticketType: z.string(),
      pricePaid: z.number(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()
    const ticketCode = `TKT-${randomBytes(4).toString('hex').toUpperCase()}`
    
    const [ticket] = await db.insert(tickets).values({
      eventId: data.eventId,
      participantName: data.participantName,
      participantEmail: data.participantEmail,
      ticketType: data.ticketType,
      pricePaid: data.pricePaid,
      ticketCode,
      issuedBy: currentUser.id,
      status: 'valid'
    }).returning()

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'ticket.issue',
      entityType: 'ticket',
      entityId: ticket.id,
      details: { ticketCode, participantEmail: data.participantEmail }
    })

    return ticket
  })

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()
    await db.delete(tickets).where(eq(tickets.id, id))
    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'ticket.delete',
      entityType: 'ticket',
      entityId: id,
    })
    return { success: true }
  })

export const updateTicketStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({
    ticketId: z.number(),
    status: z.enum(['valid', 'used', 'cancelled'])
  }).parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()
    await db.update(tickets).set({ status: data.status }).where(eq(tickets.id, data.ticketId))
    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'ticket.update_status',
      entityType: 'ticket',
      entityId: data.ticketId,
      details: { status: data.status }
    })
    return { success: true }
  })

export const verifyTicketByCodeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({
    code: z.string(),
    markAsUsed: z.boolean().default(false)
  }).parse(data))
  .handler(async ({ data }) => {
    const db = await getDb()
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketCode, data.code)).limit(1)
    
    if (!ticket) throw new Error('Ticket not found')
    
    const [event] = await db.select().from(events).where(eq(events.id, ticket.eventId)).limit(1)
    
    if (data.markAsUsed && ticket.status === 'valid') {
      await db.update(tickets).set({ status: 'used', scannedAt: new Date() }).where(eq(tickets.id, ticket.id))
      return { success: true, ticket: { ...ticket, status: 'used' }, event, checkingIn: true }
    }
    
    return { success: true, ticket, event, checkingIn: false }
  })

export const resendTicketEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ ticketId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, data.ticketId)).limit(1)
    if (!ticket) throw new Error('Ticket not found')
    
    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'ticket.resend_email',
      entityType: 'ticket',
      entityId: ticket.id,
    })
    return { success: true }
  })
