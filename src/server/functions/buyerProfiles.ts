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

function normalizeEmail(email: string | null | undefined) {
  return (email ?? '').trim().toLowerCase()
}

export const getMemberProfilesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await checkAdmin()
  const db = await getDb()

  const [profiles, ticketRows, eventRows] = await Promise.all([
    db.select().from(buyerProfiles).orderBy(buyerProfiles.name),
    db.select().from(tickets),
    db.select().from(events),
  ])

  const eventsById = new Map(eventRows.map((event) => [event.id, event]))
  const ticketsByEmail = new Map<string, typeof ticketRows>()

  for (const ticket of ticketRows) {
    const key = normalizeEmail(ticket.participantEmail)
    if (!key) continue
    const existing = ticketsByEmail.get(key) ?? []
    existing.push(ticket)
    ticketsByEmail.set(key, existing)
  }

  const enrichedProfiles = profiles.map((profile) => {
    const linkedTickets = profile.email ? ticketsByEmail.get(normalizeEmail(profile.email)) ?? [] : []
    const linkedEvents = new Map<number, (typeof eventRows)[number]>()
    let totalSpent = 0
    let attendedCount = 0

    for (const ticket of linkedTickets) {
      totalSpent += ticket.pricePaid ?? 0
      if (ticket.status === 'used') attendedCount += 1
      const event = eventsById.get(ticket.eventId)
      if (event) linkedEvents.set(event.id, event)
    }

    const sortedTickets = linkedTickets
      .slice()
      .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())

    return {
      ...profile,
      linkedTickets: sortedTickets.map((ticket) => ({
        ...ticket,
        eventTitle: eventsById.get(ticket.eventId)?.title ?? 'Okänt event',
        eventDate: eventsById.get(ticket.eventId)?.date ?? null,
      })),
      ticketCount: linkedTickets.length,
      attendedCount,
      eventCount: linkedEvents.size,
      totalSpent,
      lastActivityAt: sortedTickets[0]?.createdAt ?? profile.updatedAt ?? profile.createdAt ?? null,
      lastEventTitle: sortedTickets[0] ? eventsById.get(sortedTickets[0].eventId)?.title ?? 'Okänt event' : null,
    }
  })

  enrichedProfiles.sort((left, right) => {
    const leftTime = new Date(left.lastActivityAt ?? 0).getTime()
    const rightTime = new Date(right.lastActivityAt ?? 0).getTime()
    if (leftTime !== rightTime) return rightTime - leftTime
    return left.name.localeCompare(right.name, 'sv')
  })

  return {
    profiles: enrichedProfiles,
    totals: {
      profiles: profiles.length,
      linkedProfiles: enrichedProfiles.filter((profile) => profile.ticketCount > 0).length,
      linkedTickets: enrichedProfiles.reduce((sum, profile) => sum + profile.ticketCount, 0),
      totalSpent: enrichedProfiles.reduce((sum, profile) => sum + profile.totalSpent, 0),
    },
  }
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

export const registerMemberProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1, 'Namn krävs'),
        email: z.string().email('Ogiltig e-postadress'),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await getDb()

    // Check if profile already exists
    const existing = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.email, data.email.toLowerCase()))
      .limit(1)

    if (existing[0]) {
      return { success: false, error: 'En profil med denna e-post finns redan.' }
    }

    // In a real Stripe integration, we would create a Stripe customer here
    // const stripeCustomer = await stripe.customers.create({
    //   email: data.email,
    //   name: data.name,
    // })
    const mockStripeCustomerId = `cus_mock_${Math.random().toString(36).substring(7)}`

    const result = await db
      .insert(buyerProfiles)
      .values({
        ...data,
        email: data.email.toLowerCase(),
        membershipStatus: 'none',
        stripeCustomerId: mockStripeCustomerId,
      })
      .returning()

    return { success: true, profile: result[0] }
  })

export const processMembershipPaymentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        profileId: z.number(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await getDb()

    const profile = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, data.profileId))
      .limit(1)

    if (!profile[0]) {
      throw new Error('Profil hittades inte')
    }

    // SIMULERA STRIPE BETALNING
    // Här skulle vi normalt anropa Stripe API för att skapa en PaymentIntent
    // eller hantera en webhook efter en lyckad betalning.

    console.log(`[MOCK PAYMENT] Behandlar betalning för ${profile[0].email}...`)

    // Simulera en liten fördröjning
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Uppdatera medlemskap vid "lyckad" betalning
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await db
      .update(buyerProfiles)
      .set({
        membershipStatus: 'active',
        membershipExpiresAt: oneYearFromNow,
        updatedAt: new Date(),
      })
      .where(eq(buyerProfiles.id, data.profileId))

    return {
      success: true,
      expiresAt: oneYearFromNow,
      message: 'Betalning genomförd (MOCK)',
    }
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
