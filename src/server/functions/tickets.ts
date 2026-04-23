'use server'
import { createServerFn } from '@tanstack/react-router'
import { getDb } from '../db/runtime'
import { tickets, posts, ticketTypes, events, users } from '../db/schema'
import { eq, and, lt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getCookie } from '@tanstack/react-router/server'
import { nanoid } from 'nanoid'
import { isDemoTesterUser, requireStaffUser } from '../lib/access'
import { writeActivityLog } from './logs'
import { sendEmail } from '../lib/email'

async function checkAdmin() {
  const user = await requireStaffUser()
  return user
}

export const getEventsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await checkAdmin()
    const db = await getDb()
    return await db.select().from(events)
  })

export const createEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.string(), // We'll parse this as a Date on the server
      location: z.string().optional(),
      image: z.string().optional(),
      published: z.boolean().default(false),
      finished: z.boolean().default(false),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.insert(events).values({
      ...data,
      date: new Date(data.date),
    }).returning()

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

export const updateEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      id: z.number(),
      title: z.string(),
      description: z.string().optional(),
      date: z.string(),
      location: z.string().optional(),
      image: z.string().optional(),
      published: z.boolean().default(false),
      finished: z.boolean().default(false),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const { id, ...updateData } = data
    
    const result = await db.update(events)
      .set({
        ...updateData,
        date: new Date(updateData.date),
        updatedAt: new Date()
      })
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

export const updateEventStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      eventId: z.number(),
      finished: z.boolean(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    
    const result = await db.update(events)
      .set({ finished: data.finished, updatedAt: new Date() })
      .where(eq(events.id, data.eventId))
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.status.update',
      entityType: 'event',
      entityId: data.eventId,
      details: { finished: data.finished },
    })

    return result[0]
  })

export const deleteEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    await db.delete(events).where(eq(events.id, id))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'event.delete',
      entityType: 'event',
      entityId: id,
    })

    return { success: true }
  })

export const getTicketTypesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await checkAdmin()
    const db = await getDb()
    return await db.select().from(ticketTypes)
  })

export const createTicketTypeFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      name: z.string(),
      price: z.number(),
      description: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.insert(ticketTypes).values(data).returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket_type.create',
      entityType: 'ticket_type',
      entityId: result[0].id,
      details: { name: result[0].name },
    })

    return result[0]
  })

export const deleteTicketTypeFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: id }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    await db.delete(ticketTypes).where(eq(ticketTypes.id, id))

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket_type.delete',
      entityType: 'ticket_type',
      entityId: id,
    })

    return { success: true }
  })

export const getTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const admin = await checkAdmin()
    const db = await getDb()
    const baseQuery = db.select({
      id: tickets.id,
      eventId: tickets.eventId,
      participantName: tickets.participantName,
      participantEmail: tickets.participantEmail,
      ticketType: tickets.ticketType,
      pricePaid: tickets.pricePaid,
      ticketCode: tickets.ticketCode,
      status: tickets.status,
      scannedAt: tickets.scannedAt,
      scannedBy: tickets.scannedBy,
      scannedByName: users.name,
      issuedBy: tickets.issuedBy,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.scannedBy, users.id))

    if (isDemoTesterUser(admin)) {
      return await baseQuery.where(eq(tickets.issuedBy, admin.id))
    }

    return await baseQuery
  })

export const getTicketFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const result = await db.select().from(tickets).where(eq(tickets.id, parseInt(ticketId))).limit(1)
    if (isDemoTesterUser(admin) && result[0] && result[0].issuedBy !== admin.id) {
      throw new Error('Forbidden in demo mode')
    }
    return result[0]
  })

export const issueTicketFn = createServerFn({ method: "POST" })
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
    const admin = await checkAdmin()
    const db = await getDb()
    
    const ticketCode = `TKT-${nanoid(8).toUpperCase()}`
    
    const newTicket = await db.insert(tickets).values({
      eventId: data.eventId,
      participantName: data.participantName,
      participantEmail: data.participantEmail,
      ticketType: data.ticketType,
      pricePaid: data.pricePaid,
      ticketCode,
      issuedBy: admin.id,
    }).returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.issue',
      entityType: 'ticket',
      entityId: newTicket[0].id,
      details: {
        code: newTicket[0].ticketCode,
        eventId: newTicket[0].eventId,
      },
    })

    return newTicket[0]
  })

export const resendTicketEmailFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ ticketId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()
    const ticket = await db.select().from(tickets).where(eq(tickets.id, data.ticketId)).limit(1)
    if (!ticket[0]) throw new Error('Ticket not found')
    
    const event = await db.select().from(events).where(eq(events.id, ticket[0].eventId)).limit(1)
    const eventTitle = event[0]?.title || 'Event'
    const eventDate = event[0]?.date ? new Date(event[0].date).toLocaleDateString('sv-SE') : 'Okänt datum'
    const ticketLink = `${process.env.BASE_URL || 'https://lankoping.se'}/biljett/${ticket[0].ticketCode}`

    const emailHtml = `
      <div style="font-family: sans-serif; max-w-xl mx-auto; background-color: #100E0C; color: #F0E8D8; padding: 2rem; border-radius: 8px; border: 1px solid rgba(192, 74, 42, 0.2);">
        <h2 style="color: #C04A2A; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-bottom: 1rem;">Lankoping Biljett</h2>
        <h1 style="font-size: 24px; margin-bottom: 1.5rem;">Din biljett till ${eventTitle}</h1>
        <p style="margin-bottom: 1rem;">Hej <strong>${ticket[0].participantName}</strong>!</p>
        <p style="margin-bottom: 1.5rem;">Här är din biljett för det kommande eventet.</p>
        
        <div style="background-color: rgba(192, 74, 42, 0.05); border: 1px solid rgba(192, 74, 42, 0.1); padding: 1.5rem; border-radius: 4px; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Namn:</strong> ${ticket[0].participantName}</p>
          <p style="margin: 0 0 0.5rem 0;"><strong>Datum:</strong> ${eventDate}</p>
          <p style="margin: 0 0 0.5rem 0;"><strong>Kostnad:</strong> ${ticket[0].pricePaid} SEK</p>
          <p style="margin: 0;"><strong>Biljettkod:</strong> <span style="font-family: monospace; background-color: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">${ticket[0].ticketCode}</span></p>
        </div>
        
        <a href="${ticketLink}" style="display: inline-block; background-color: #C04A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">Visa digital biljett</a>
        
        <p style="font-size: 12px; color: rgba(240, 232, 216, 0.6); margin-bottom: 0.5rem;">Ha biljetten redo i mobilen när du kommer till entrén.</p>
        <p style="font-size: 12px; color: rgba(240, 232, 216, 0.6); margin-bottom: 0.5rem;">Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:</p>
        <p style="font-size: 12px; color: #C04A2A; word-break: break-all;">${ticketLink}</p>
      </div>`

    const sent = await sendEmail({
      to: ticket[0].participantEmail,
      subject: `Din biljett för ${eventTitle}`,
      text: `Hej ${ticket[0].participantName}! Din biljettkod för ${eventTitle} (${eventDate}) är ${ticket[0].ticketCode}. Kostnad: ${ticket[0].pricePaid} SEK. Visa biljetten här: ${ticketLink}`,
      html: emailHtml,
    })

    if (!sent) throw new Error('Failed to send email')

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.email.resend',
      entityType: 'ticket',
      entityId: ticket[0].id,
    })

    return { success: true }
  })

export const updateTicketStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      ticketId: z.number(),
      status: z.enum(['valid', 'used', 'cancelled']),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await checkAdmin()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      const existing = await db.select().from(tickets).where(eq(tickets.id, data.ticketId)).limit(1)
      if (!existing[0] || existing[0].issuedBy !== admin.id) {
        throw new Error('Forbidden in demo mode')
      }
    }

    const scanDate = data.status === 'used' ? new Date() : null
    const updated = await db.update(tickets)
      .set({ 
        status: data.status, 
        scannedAt: scanDate, 
        scannedBy: data.status === 'used' ? admin.id : null,
        updatedAt: new Date() 
      })
      .where(eq(tickets.id, data.ticketId))
      .returning()

    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.status.update',
      entityType: 'ticket',
      entityId: data.ticketId,
      details: { status: data.status },
    })

    return updated[0]
  })

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.number().parse(data))
  .handler(async ({ data: ticketId }) => {
    const admin = await checkAdmin()
    const db = await getDb()

    if (isDemoTesterUser(admin)) {
      const existing = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1)
      if (!existing[0] || existing[0].issuedBy !== admin.id) {
        throw new Error('Forbidden in demo mode')
      }
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

export const verifyTicketByCodeFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      code: z.string(),
      markAsUsed: z.boolean().default(true),
    }).parse(data)
  )
  .handler(async ({ data: { code, markAsUsed } }) => {
    const db = await getDb()
    // Try to get adminId if they're logged in
    let adminId: number | null = null
    let adminRole: 'organizer' | 'volunteer' | null = null
    let demoRestricted = false
    try {
      const admin = await checkAdmin()
      adminId = admin.id
      adminRole = admin.role
      demoRestricted = isDemoTesterUser(admin)
    } catch (e) {
      // Not logged in or not admin, that's fine for public verification
    }

    const result = await db.select().from(tickets).where(eq(tickets.ticketCode, code)).limit(1)
    if (result.length === 0) return { success: false, message: 'Ogiltig biljettkod' }
    
    const ticket = result[0]

    if (demoRestricted && adminId && ticket.issuedBy !== adminId) {
      throw new Error('Forbidden in demo mode')
    }

    let checkingIn = false
    
    // If ticket is valid, mark it as used and record scan time ONLY if markAsUsed is true
    if (ticket.status === 'valid' && markAsUsed) {
      checkingIn = true
      const scanDate = new Date()
      await db.update(tickets)
        .set({ 
          status: 'used', 
          scannedAt: scanDate, 
          scannedBy: adminId,
          updatedAt: scanDate 
        })
        .where(eq(tickets.id, ticket.id))

      if (adminId && adminRole) {
        await writeActivityLog({
          actorUserId: adminId,
          actorRole: adminRole,
          action: 'ticket.verify.checkin',
          entityType: 'ticket',
          entityId: ticket.id,
          details: { code },
        })
      }
      
      // Update local object for response
      ticket.status = 'used'
      ticket.scannedAt = scanDate
      ticket.scannedBy = adminId
    }

    // Also get event details from the events table
    const event = await db.select().from(events).where(eq(events.id, ticket.eventId)).limit(1)
    
    return { 
      success: true, 
      ticket, 
      event: event[0] || null,
      checkingIn
    }
  })

export const getEventsForTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await checkAdmin()
    const db = await getDb()
    return await db.select().from(events)
  })

export const cleanupOldTicketsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const admin = await requireStaffUser()
    const db = await getDb()
    
    // Anonymize tickets 30 days after the event has ended AND the event is marked as finished
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Find events that are finished AND older than 30 days
    const oldEvents = await db.select({ id: events.id })
      .from(events)
      .where(and(eq(events.finished, true), lt(events.date, thirtyDaysAgo)))
      
    const oldEventIds = oldEvents.map(e => e.id)

    if (oldEventIds.length > 0) {
      const eventIdsList = oldEventIds.join(',')
      await db.execute(sql`
        UPDATE tickets 
        SET participant_name = 'Anonymized', participant_email = 'anonymized@example.com'
        WHERE event_id IN (${sql.raw(eventIdsList)}) 
        AND participant_name != 'Anonymized'
      `)
    }
      
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.cleanup.anonymize',
      entityType: 'ticket',
    })
      
    return { success: true }
  })
