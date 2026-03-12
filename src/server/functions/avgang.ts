'use server'
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index'
import { avgangsRequests } from '../db/schema'
import { getCookie } from '@tanstack/react-start/server'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

export const getAvgangRequestsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const requests = await db
      .select()
      .from(avgangsRequests)
      .orderBy(desc(avgangsRequests.createdAt))
    return requests
  })

export const createAvgangRequestFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        namn: z.string(),
        pnr: z.string(),
        roll: z.string(),
        orsak: z.string(),
        datum: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const request = await db
      .insert(avgangsRequests)
      .values({
        namn: data.namn,
        pnr: data.pnr,
        roll: data.roll,
        orsak: data.orsak,
        datum: new Date(data.datum),
        status: 'pending',
      })
      .returning()

    return request[0]
  })

export const updateAvgangStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
        status: z.enum(['pending', 'approved', 'rejected', 'archived']),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const currentUserId = getCookie('session')
    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const updated = await db
      .update(avgangsRequests)
      .set({
        status: data.status,
        reviewedBy: parseInt(currentUserId),
        updatedAt: new Date(),
      })
      .where(eq(avgangsRequests.id, data.id))
      .returning()

    return updated[0]
  })

export const generateAvgangPdfFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.number(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const request = await db
      .select()
      .from(avgangsRequests)
      .where(eq(avgangsRequests.id, data.id))
      .limit(1)

    if (!request[0]) {
      throw new Error('Request not found')
    }

    // I produktion skulle detta generera en PDF
    const pdfContent = `
AVGÅNGSBREV

Namn: ${request[0].namn}
Personnummer: ${request[0].pnr}
Roll: ${request[0].roll}
Avgångsdatum: ${request[0].datum?.toLocaleDateString('sv-SE')}
Anledning: ${request[0].orsak}

Signerat av: ${new Date().toLocaleDateString('sv-SE')}
`

    return {
      success: true,
      pdf: pdfContent,
      requestId: request[0].id,
    }
  })
