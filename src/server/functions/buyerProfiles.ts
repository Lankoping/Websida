"use server"
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { buyerProfiles } from '../db/schema'
import { tickets, events } from '../db/schema'
import { inArray } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireStaffUser } from '../lib/access'
import { writeActivityLog } from './logs'

async function checkAdmin() {
  return await requireStaffUser()
}

export const getBuyerProfilesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()
  return await db.select().from(buyerProfiles).orderBy(buyerProfiles.name)
})

export const createBuyerProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        externalId: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.insert(buyerProfiles).values(data).returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'buyer_profile.create',
      entityType: 'buyer_profile',
      entityId: result[0].id,
      details: { name: result[0].name },
    })
    return result[0]
  })

export const updateBuyerProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        externalId: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const { id, ...updateData } = data
    const result = await db
      .update(buyerProfiles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(buyerProfiles.id, id))
      .returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'buyer_profile.update',
      entityType: 'buyer_profile',
      entityId: id,
      details: { name: result[0].name },
    })
    return result[0]
  })

export const deleteBuyerProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    await db.delete(buyerProfiles).where(eq(buyerProfiles.id, id))
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'buyer_profile.delete',
      entityType: 'buyer_profile',
      entityId: id,
    })
    return { success: true }
  })

export const importTicketToBuyerProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const found = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1)
    if (!found[0]) throw new Error('Biljett ej hittad')
    const t = found[0]
    // Prefer matching by email if available
    if (t.participantEmail) {
      const existing = await db.select().from(buyerProfiles).where(eq(buyerProfiles.email, t.participantEmail)).limit(1)
      if (existing[0]) {
        const result = await db
          .update(buyerProfiles)
          .set({ name: t.participantName, updatedAt: new Date() })
          .where(eq(buyerProfiles.id, existing[0].id))
          .returning()
        await writeActivityLog({
          actorUserId: admin.id,
          actorRole: admin.role,
          action: 'buyer_profile.import_ticket.update',
          entityType: 'buyer_profile',
          entityId: existing[0].id,
          details: { ticketId },
        })
        return result[0]
      }
    }

    const created = await db.insert(buyerProfiles).values({ name: t.participantName, email: t.participantEmail, notes: `Imported from ticket ${t.id} (event ${t.eventId})` }).returning()
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'buyer_profile.import_ticket.create',
      entityType: 'buyer_profile',
      entityId: created[0].id,
      details: { ticketId },
    })
    return created[0]
  })

export const importEventToBuyerProfilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: eventId }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const ev = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (!ev[0]) throw new Error('Event ej hittat')
    const rows = await db.select().from(tickets).where(eq(tickets.eventId, eventId))
    const created: any[] = []
    for (const t of rows) {
      if (!t.participantEmail) {
        // skip entries without email to avoid duplicates
        const c = await db.insert(buyerProfiles).values({ name: t.participantName, notes: `Imported from ticket ${t.id} (no email)` }).returning()
        created.push(c[0])
        continue
      }
      const existing = await db.select().from(buyerProfiles).where(eq(buyerProfiles.email, t.participantEmail)).limit(1)
      if (existing[0]) continue
      const c = await db.insert(buyerProfiles).values({ name: t.participantName, email: t.participantEmail, notes: `Imported from event ${eventId} ticket ${t.id}` }).returning()
      created.push(c[0])
    }
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'buyer_profile.import_event',
      entityType: 'event',
      entityId: eventId,
      details: { createdCount: created.length },
    })
    return { createdCount: created.length, created }
  })
