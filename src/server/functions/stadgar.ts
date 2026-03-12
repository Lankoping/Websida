'use server'
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index'
import { stadgar } from '../db/schema'
import { getCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const getStadgarFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const data = await db.select().from(stadgar).limit(1)
    return data[0] || {
      id: 0,
      content: `# Stadgar för Lanköpings Studentkår

## Preliminär version

[Stadgar-innehållet läggs till här]

Signering krävs från:
- Elias (Ordförande)
- Victor (Sekreterare)
- Tredje representant
`,
      signatures: JSON.stringify({
        "Elias": true,
        "Victor": true,
        "Tredje": false
      }),
      updatedAt: new Date(),
      createdAt: new Date(),
    }
  })

export const updateStadgarFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        content: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const currentUserId = getCookie('session')
    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const existing = await db.select().from(stadgar).limit(1)
    
    if (existing.length > 0) {
      await db
        .update(stadgar)
        .set({
          content: data.content,
          updatedBy: parseInt(currentUserId),
          updatedAt: new Date(),
        })
        .where(eq(stadgar.id, existing[0].id))
      return existing[0]
    } else {
      const result = await db
        .insert(stadgar)
        .values({
          content: data.content,
          updatedBy: parseInt(currentUserId),
          signatures: JSON.stringify({}),
        })
        .returning()
      return result[0]
    }
  })

export const updateSignatureFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string(),
        signed: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const currentUserId = getCookie('session')
    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const existing = await db.select().from(stadgar).limit(1)
    if (!existing[0]) {
      throw new Error('Stadgar not found')
    }

    const sigs = JSON.parse(existing[0].signatures || '{}')
    sigs[data.name] = data.signed

    await db
      .update(stadgar)
      .set({
        signatures: JSON.stringify(sigs),
        updatedBy: parseInt(currentUserId),
        updatedAt: new Date(),
      })
      .where(eq(stadgar.id, existing[0].id))

    return { ...existing[0], signatures: JSON.stringify(sigs) }
  })

export const exportStadgarPdfFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const currentUserId = getCookie('session')
    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const data = await db.select().from(stadgar).limit(1)
    if (!data[0]) {
      throw new Error('Stadgar not found')
    }

    // För nu, returnera bara en export-prompt
    // I produktion skulle detta generera en PDF och gå till Google Docs
    return {
      success: true,
      message: 'Stadgar exporterade',
      content: data[0].content,
      signatures: data[0].signatures,
    }
  })
