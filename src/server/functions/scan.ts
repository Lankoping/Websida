'use server'
import { createServerFn } from '@tanstack/react-router'
import { getDb } from '../db/runtime'
import { tickets, users } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { writeActivityLog } from './logs'
import { requireStaffUser } from '../lib/access'

/** Returns all tickets belonging to the same participant email within the same event. */
export const getRelatedTicketsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        participantEmail: z.string().email(),
        eventId: z.number(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await getDb()
    return await db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        ticketType: tickets.ticketType,
        status: tickets.status,
        participantName: tickets.participantName,
        pricePaid: tickets.pricePaid,
        scannedAt: tickets.scannedAt,
        scannedByName: users.name,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.scannedBy, users.id))
      .where(and(eq(tickets.participantEmail, data.participantEmail), eq(tickets.eventId, data.eventId)))
      .orderBy(tickets.createdAt)
  })

/** Marks all remaining valid tickets for an email+event as used. */
export const markAllTicketsUsedFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        participantEmail: z.string().email(),
        eventId: z.number(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    let adminId: number | null = null
    let adminRole: 'organizer' | 'volunteer' | null = null
    try {
      const admin = await requireStaffUser()
      adminId = admin.id
      adminRole = admin.role
    } catch {
      // Public verification — no logged-in user, still allowed
    }

    const db = await getDb()
    const scanDate = new Date()

    const validTickets = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(
        and(
          eq(tickets.participantEmail, data.participantEmail),
          eq(tickets.eventId, data.eventId),
          eq(tickets.status, 'valid'),
        ),
      )

    for (const ticket of validTickets) {
      await db
        .update(tickets)
        .set({ status: 'used', scannedAt: scanDate, scannedBy: adminId, updatedAt: scanDate })
        .where(eq(tickets.id, ticket.id))

      if (adminId && adminRole) {
        await writeActivityLog({
          actorUserId: adminId,
          actorRole: adminRole,
          action: 'ticket.verify.checkin.bulk',
          entityType: 'ticket',
          entityId: ticket.id,
        })
      }
    }

    return { success: true, markedCount: validTickets.length }
  })
