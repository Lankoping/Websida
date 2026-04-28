'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { tickets, users, eventTicketTypes, ticketTypes, companies, companyTicketPricing, events } from '../db/schema'
import { eq, inArray, and, desc, asc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { writeActivityLog } from './logs'
import { isDemoTesterUser, requireOrganizerUser, requireStaffUser } from '../lib/access'
import { sendEmail } from '../lib/email'

export const getTicketsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireStaffUser()
  const db = await getDb()
  return await db
    .select({
      id: tickets.id,
      ticketCode: tickets.ticketCode,
      eventId: tickets.eventId,
      ticketType: tickets.ticketType,
      status: tickets.status,
      participantName: tickets.participantName,
      participantEmail: tickets.participantEmail,
      participantPhone: tickets.participantPhone,
      participantCompany: tickets.participantCompany,
      participantDietary: tickets.participantDietary,
      participantOther: tickets.participantOther,
      pricePaid: tickets.pricePaid,
      paymentStatus: tickets.paymentStatus,
      paymentMethod: tickets.paymentMethod,
      paymentReference: tickets.paymentReference,
      issuedBy: tickets.issuedBy,
      scannedAt: tickets.scannedAt,
      scannedBy: tickets.scannedBy,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      issuedByName: users.name,
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.issuedBy, users.id))
    .orderBy(desc(tickets.createdAt))
})

export const getTicketDetailsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    await requireStaffUser()
    const db = await getDb()
    const result = await db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        eventId: tickets.eventId,
        ticketType: tickets.ticketType,
        status: tickets.status,
        participantName: tickets.participantName,
        participantEmail: tickets.participantEmail,
        participantPhone: tickets.participantPhone,
        participantCompany: tickets.participantCompany,
        participantDietary: tickets.participantDietary,
        participantOther: tickets.participantOther,
        pricePaid: tickets.pricePaid,
        paymentStatus: tickets.paymentStatus,
        paymentMethod: tickets.paymentMethod,
        paymentReference: tickets.paymentReference,
        issuedBy: tickets.issuedBy,
        scannedAt: tickets.scannedAt,
        scannedBy: tickets.scannedBy,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        issuedByName: users.name,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.issuedBy, users.id))
      .where(eq(tickets.id, ticketId))
      .limit(1)

    if (result.length === 0) return null

    const ticket = result[0]
    let scannedByName = null

    if (ticket.scannedBy) {
      const scanner = await db.select({ name: users.name }).from(users).where(eq(users.id, ticket.scannedBy)).limit(1)
      if (scanner.length > 0) {
        scannedByName = scanner[0].name
      }
    }

    return { ...ticket, scannedByName }
  })

export const issueTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventId: z.number(),
        ticketType: z.string(),
        participantName: z.string().min(1),
        participantEmail: z.string().email(),
        participantPhone: z.string().optional(),
        participantCompany: z.string().optional(),
        participantDietary: z.string().optional(),
        participantOther: z.string().optional(),
        pricePaid: z.number().min(0),
        paymentStatus: z.enum(['pending', 'paid', 'refunded']).default('paid'),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
        issuanceType: z.enum(['company', 'private']).default('private'),
        ticketCount: z.number().min(1).default(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    // Enforce maxQuantity if the ticket type has a limit
    const ticketTypeRecord = await db.select().from(ticketTypes).where(eq(ticketTypes.name, data.ticketType)).limit(1)
    if (ticketTypeRecord.length > 0) {
      const eventTicketTypeRecord = await db
        .select()
        .from(eventTicketTypes)
        .where(
          and(
            eq(eventTicketTypes.eventId, data.eventId),
            eq(eventTicketTypes.ticketTypeId, ticketTypeRecord[0].id)
          )
        )
        .limit(1)
        
      if (eventTicketTypeRecord.length > 0 && eventTicketTypeRecord[0].maxQuantity !== null) {
        // Count how many valid tickets of this type have been issued for this event
        const existingTickets = await db
          .select({ count: sql<number>`count(*)` })
          .from(tickets)
          .where(
            and(
              eq(tickets.eventId, data.eventId),
              eq(tickets.ticketType, data.ticketType),
              eq(tickets.status, 'valid')
            )
          )
          
        const currentCount = Number(existingTickets[0]?.count || 0)
        if (currentCount + data.ticketCount > eventTicketTypeRecord[0].maxQuantity) {
          throw new Error(`Kan inte utfärda ${data.ticketCount} biljetter. Endast ${eventTicketTypeRecord[0].maxQuantity - currentCount} biljetter av typen "${data.ticketType}" finns kvar.`)
        }
      }
    }

    const ticketCode =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()

    const result = await db
      .insert(tickets)
      .values({
        ...data,
        ticketCode,
        status: 'valid',
        issuedBy: admin.id,
      })
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.issue',
      entityType: 'ticket',
      entityId: result[0].id,
      details: {
        ticketCode,
        ticketType: data.ticketType,
        participantEmail: data.participantEmail,
      },
    })

    return result[0]
  })

export const updateTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
        participantName: z.string().min(1),
        participantEmail: z.string().email(),
        participantPhone: z.string().optional(),
        participantCompany: z.string().optional(),
        participantDietary: z.string().optional(),
        participantOther: z.string().optional(),
        paymentStatus: z.enum(['pending', 'paid', 'refunded']),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const { id, ...updateData } = data
    const result = await db
      .update(tickets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.update',
      entityType: 'ticket',
      entityId: id,
    })

    return result[0]
  })

export const verifyTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ ticketCode: z.string() }).parse(data))
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
    const result = await db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        eventId: tickets.eventId,
        ticketType: tickets.ticketType,
        status: tickets.status,
        participantName: tickets.participantName,
        participantEmail: tickets.participantEmail,
        participantPhone: tickets.participantPhone,
        participantCompany: tickets.participantCompany,
        participantDietary: tickets.participantDietary,
        participantOther: tickets.participantOther,
        pricePaid: tickets.pricePaid,
        scannedAt: tickets.scannedAt,
        scannedBy: tickets.scannedBy,
      })
      .from(tickets)
      .where(eq(tickets.ticketCode, data.ticketCode))
      .limit(1)

    if (result.length === 0) {
      return { valid: false, message: 'Biljetten hittades inte.' }
    }

    const ticket = result[0]

    if (ticket.status === 'used') {
      return { valid: false, message: 'Biljetten är redan använd.', ticket }
    }
    if (ticket.status === 'cancelled') {
      return { valid: false, message: 'Biljetten är makulerad.', ticket }
    }

    // Mark as used
    const scanDate = new Date()
    await db
      .update(tickets)
      .set({ status: 'used', scannedAt: scanDate, scannedBy: adminId, updatedAt: scanDate })
      .where(eq(tickets.id, ticket.id))

    if (adminId && adminRole) {
      await writeActivityLog({
        actorUserId: adminId,
        actorRole: adminRole,
        action: 'ticket.verify.checkin',
        entityType: 'ticket',
        entityId: ticket.id,
      })
    }

    return { valid: true, message: 'Biljetten är giltig och har nu markerats som använd.', ticket }
  })

export const cancelTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    await db.update(tickets).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(tickets.id, ticketId))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.cancel',
      entityType: 'ticket',
      entityId: ticketId,
    })

    return { success: true }
  })

export const restoreTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    await db
      .update(tickets)
      .set({ status: 'valid', scannedAt: null, scannedBy: null, updatedAt: new Date() })
      .where(eq(tickets.id, ticketId))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.restore',
      entityType: 'ticket',
      entityId: ticketId,
    })

    return { success: true }
  })

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    await db.delete(tickets).where(eq(tickets.id, ticketId))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.delete',
      entityType: 'ticket',
      entityId: ticketId,
    })

    return { success: true }
  })

export const bulkIssueTicketsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventId: z.number(),
        tickets: z.array(
          z.object({
            ticketType: z.string(),
            participantName: z.string().min(1),
            participantEmail: z.string().email(),
            participantPhone: z.string().optional(),
            participantCompany: z.string().optional(),
            participantDietary: z.string().optional(),
            participantOther: z.string().optional(),
            pricePaid: z.number().min(0),
            paymentStatus: z.enum(['pending', 'paid', 'refunded']).default('paid'),
            paymentMethod: z.string().optional(),
            paymentReference: z.string().optional(),
            issuanceType: z.enum(['company', 'private']).default('private'),
            ticketCount: z.number().min(1).default(1),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    // Enforce maxQuantity for bulk tickets
    const ticketCountsByType: Record<string, number> = {}
    for (const t of data.tickets) {
      ticketCountsByType[t.ticketType] = (ticketCountsByType[t.ticketType] || 0) + 1
    }

    for (const [typeName, requestedCount] of Object.entries(ticketCountsByType)) {
      const ticketTypeRecord = await db.select().from(ticketTypes).where(eq(ticketTypes.name, typeName)).limit(1)
      if (ticketTypeRecord.length > 0) {
        const eventTicketTypeRecord = await db
          .select()
          .from(eventTicketTypes)
          .where(
            and(
              eq(eventTicketTypes.eventId, data.eventId),
              eq(eventTicketTypes.ticketTypeId, ticketTypeRecord[0].id)
            )
          )
          .limit(1)
          
        if (eventTicketTypeRecord.length > 0 && eventTicketTypeRecord[0].maxQuantity !== null) {
          const existingTickets = await db
            .select({ count: sql<number>`count(*)` })
            .from(tickets)
            .where(
              and(
                eq(tickets.eventId, data.eventId),
                eq(tickets.ticketType, typeName),
                eq(tickets.status, 'valid')
              )
            )
            
          const currentCount = Number(existingTickets[0]?.count || 0)
          if (currentCount + requestedCount > eventTicketTypeRecord[0].maxQuantity) {
            throw new Error(`Kan inte utfärda ${requestedCount} biljetter av typen "${typeName}". Endast ${eventTicketTypeRecord[0].maxQuantity - currentCount} biljetter finns kvar.`)
          }
        }
      }
    }

    const newTickets = data.tickets.map((t) => ({
      ...t,
      eventId: data.eventId,
      ticketCode:
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase(),
      status: 'valid' as const,
      issuedBy: admin.id,
    }))

    const result = await db.insert(tickets).values(newTickets).returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.issue.bulk',
      entityType: 'ticket',
      details: {
        count: result.length,
        eventId: data.eventId,
      },
    })

    return result
  })

export const getTicketTypesForEventFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: eventId }) => {
    await requireStaffUser()
    const db = await getDb()

    // 1. Get all enabled ticket types for this event
    const activeTypes = await db
      .select({
        ticketTypeId: eventTicketTypes.ticketTypeId,
        name: ticketTypes.name,
        price: ticketTypes.price,
        maxQuantity: eventTicketTypes.maxQuantity,
      })
      .from(eventTicketTypes)
      .innerJoin(ticketTypes, eq(eventTicketTypes.ticketTypeId, ticketTypes.id))
      .where(and(eq(eventTicketTypes.eventId, eventId), eq(eventTicketTypes.enabled, true)))

    // 2. Get all companies and their custom pricing rules
    const allCompanies = await db.select().from(companies).orderBy(asc(companies.name))
    const allPricingRules = await db.select().from(companyTicketPricing)

    // 3. Build the response structure
    return {
      ticketTypes: activeTypes,
      companies: allCompanies,
      pricingRules: allPricingRules,
    }
  })

export const getEventsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireStaffUser()
  const db = await getDb()
  return await db.select().from(events).orderBy(desc(events.date))
})

export const getEventsForTicketsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireStaffUser()
  const db = await getDb()
  return await db.select().from(events).orderBy(desc(events.date))
})

export const getTicketTypesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireStaffUser()
  const db = await getDb()
  return await db.select().from(ticketTypes).orderBy(asc(ticketTypes.name))
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
        published: z.boolean(),
        finished: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const result = await db.insert(events).values({ ...data, date: new Date(data.date) }).returning()

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
        published: z.boolean(),
        finished: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const { id, ...updateData } = data
    const result = await db
      .update(events)
      .set({ ...updateData, date: new Date(updateData.date), updatedAt: new Date() })
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
  .handler(async ({ data: eventId }) => {
    const admin = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    await db.delete(events).where(eq(events.id, eventId))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.delete',
      entityType: 'event',
      entityId: eventId,
    })

    return { success: true }
  })

export const updateEventStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventId: z.number(),
        finished: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const result = await db
      .update(events)
      .set({ finished: data.finished, updatedAt: new Date() })
      .where(eq(events.id, data.eventId))
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.update_status',
      entityType: 'event',
      entityId: data.eventId,
      details: { finished: data.finished },
    })

    return result[0]
  })

export const createTicketTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        price: z.number().min(0),
        description: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const result = await db.insert(ticketTypes).values(data).returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticketType.create',
      entityType: 'ticketType',
      entityId: result[0].id,
      details: { name: result[0].name },
    })

    return result[0]
  })

export const deleteTicketTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketTypeId }) => {
    const admin = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    await db.delete(ticketTypes).where(eq(ticketTypes.id, ticketTypeId))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticketType.delete',
      entityType: 'ticketType',
      entityId: ticketTypeId,
    })

    return { success: true }
  })

export const updateTicketStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        ticketId: z.number(),
        status: z.enum(['valid', 'used', 'cancelled']),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
    }

    const result = await db
      .update(tickets)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(tickets.id, data.ticketId))
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.update_status',
      entityType: 'ticket',
      entityId: data.ticketId,
      details: { status: data.status },
    })

    return result[0]
  })

export const verifyTicketByCodeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string(), markAsUsed: z.boolean().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    const result = await db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        eventId: tickets.eventId,
        ticketType: tickets.ticketType,
        status: tickets.status,
        participantName: tickets.participantName,
        participantEmail: tickets.participantEmail,
        participantPhone: tickets.participantPhone,
        participantCompany: tickets.participantCompany,
        participantDietary: tickets.participantDietary,
        participantOther: tickets.participantOther,
        pricePaid: tickets.pricePaid,
        scannedAt: tickets.scannedAt,
        scannedBy: tickets.scannedBy,
      })
      .from(tickets)
      .where(eq(tickets.ticketCode, data.code))
      .limit(1)

    if (result.length === 0) {
      return { success: false, message: 'Biljetten hittades inte.' }
    }

    const ticket = result[0]

    if (ticket.status === 'used') {
      return { success: false, message: 'Biljetten är redan använd.', ticket }
    }
    if (ticket.status === 'cancelled') {
      return { success: false, message: 'Biljetten är makulerad.', ticket }
    }

    if (data.markAsUsed) {
      if (isDemoTesterUser(admin)) {
        throw new Error('Forbidden in demo mode')
      }

      const scanDate = new Date()
      await db
        .update(tickets)
        .set({ status: 'used', scannedAt: scanDate, scannedBy: admin.id, updatedAt: scanDate })
        .where(eq(tickets.id, ticket.id))

      await writeActivityLog({
        actorUserId: admin.id,
        actorRole: admin.role,
        action: 'ticket.verify.checkin',
        entityType: 'ticket',
        entityId: ticket.id,
      })

      return { success: true, message: 'Biljetten är giltig och har nu markerats som använd.', ticket, checkingIn: true }
    }

    return { success: true, message: 'Biljetten är giltig.', ticket, checkingIn: false }
  })

export const resendTicketEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ ticketId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    const result = await db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        participantName: tickets.participantName,
        participantEmail: tickets.participantEmail,
        eventId: tickets.eventId,
      })
      .from(tickets)
      .where(eq(tickets.id, data.ticketId))
      .limit(1)

    if (result.length === 0) {
      throw new Error('Biljetten hittades inte.')
    }

    const ticket = result[0]
    const event = await db.select({ title: events.title }).from(events).where(eq(events.id, ticket.eventId)).limit(1)

    const baseUrl = process.env.BASE_URL || 'https://lankoping.se'
    const ticketUrl = `${baseUrl}/biljett/${ticket.ticketCode}`

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #333;">Här är din biljett!</h2>
        <p>Hej ${ticket.participantName},</p>
        <p>Här är din biljett för <strong>${event[0]?.title || 'Eventet'}</strong>.</p>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #ddd;">
          <p style="font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${ticket.ticketCode}</p>
        </div>
        <p>Du kan visa din biljett och QR-kod genom att klicka på knappen nedan:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ticketUrl}" style="background-color: #C04A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Visa Biljett</a>
        </div>
        <p style="color: #666; font-size: 12px;">Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare: <br>${ticketUrl}</p>
      </div>
    `

    const emailSent = await sendEmail({
      to: ticket.participantEmail,
      subject: `Din biljett till ${event[0]?.title || 'Eventet'}`,
      text: `Här är din biljettkod: ${ticket.ticketCode}. Visa din biljett här: ${ticketUrl}`,
      html: emailHtml,
    })

    if (!emailSent) {
      throw new Error('Kunde inte skicka e-post.')
    }

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.resend_email',
      entityType: 'ticket',
      entityId: ticket.id,
    })

    return { success: true }
  })
