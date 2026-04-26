'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { tickets, users, eventTicketTypes, ticketTypes, companies, companyTicketPricing } from '../db/schema'
import { eq, inArray, and, desc, asc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { writeActivityLog } from './logs'
import { isDemoTesterUser, requireOrganizerUser, requireStaffUser } from '../lib/access'

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
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireStaffUser()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      throw new Error('Forbidden in demo mode')
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
