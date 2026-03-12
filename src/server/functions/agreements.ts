'use server'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/index'
import { agreements, users } from '../db/schema'
import { requireOrganizerUser, requireStaffUser } from '../lib/access'

async function enrichAgreement(record: typeof agreements.$inferSelect, allUsers: (typeof users.$inferSelect)[]) {
  const signerIds: number[] = JSON.parse(record.requiredSigners || '[]')
  const digitalSignatures: Record<string, boolean> = JSON.parse(record.digitalSignatures || '{}')

  const requiredSigners = signerIds.map((id) => {
    const user = allUsers.find((candidate) => candidate.id === id)
    return {
      userId: id,
      name: user?.name || 'Okand anvandare',
      email: user?.email || '',
      signed: digitalSignatures[id] === true,
      role: user?.role || 'volunteer',
    }
  })

  const createdByUser = record.createdByUserId ? allUsers.find((candidate) => candidate.id === record.createdByUserId) : null
  const generatedByUser = record.generatedBy ? allUsers.find((candidate) => candidate.id === record.generatedBy) : null

  return {
    ...record,
    requiredSigners,
    createdByName: createdByUser?.name || null,
    generatedByName: generatedByUser?.name || null,
    allSigned: signerIds.length > 0 && signerIds.every((id) => digitalSignatures[id] === true),
  }
}

export const getAgreementsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireStaffUser()
    const rows = await db.select().from(agreements).orderBy(desc(agreements.createdAt))
    const allUsers = await db.select().from(users)
    return Promise.all(rows.map((row) => enrichAgreement(row, allUsers)))
  })

export const getMyPendingAgreementSignaturesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const currentUser = await requireStaffUser()
    const rows = await db.select().from(agreements).orderBy(desc(agreements.createdAt))
    const allUsers = await db.select().from(users)
    const enriched = await Promise.all(rows.map((row) => enrichAgreement(row, allUsers)))
    return enriched.filter((agreement) =>
      agreement.status !== 'archived' &&
      agreement.requiredSigners.some((signer) => signer.userId === currentUser.id && !signer.signed),
    )
  })

export const createAgreementFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      body: z.string().min(1),
      requiredSignerIds: z.array(z.number()).default([]),
      status: z.enum(['draft', 'active']).default('draft'),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const inserted = await db.insert(agreements).values({
      title: data.title,
      description: data.description,
      body: data.body,
      status: data.status,
      createdByUserId: currentUser.id,
      requiredSigners: JSON.stringify(data.requiredSignerIds),
      digitalSignatures: '{}',
    }).returning()

    const allUsers = await db.select().from(users)
    return enrichAgreement(inserted[0], allUsers)
  })

export const updateAgreementFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      id: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      body: z.string().min(1),
      requiredSignerIds: z.array(z.number()).default([]),
      status: z.enum(['draft', 'active', 'completed', 'archived']),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireOrganizerUser()
    const current = await db.select().from(agreements).where(eq(agreements.id, data.id)).limit(1)
    if (!current[0]) {
      throw new Error('Agreement not found')
    }

    const existingSignatures: Record<string, boolean> = JSON.parse(current[0].digitalSignatures || '{}')
    const allowedSignatureEntries = Object.entries(existingSignatures).filter(([key]) => data.requiredSignerIds.includes(Number(key)))

    const updated = await db.update(agreements)
      .set({
        title: data.title,
        description: data.description,
        body: data.body,
        status: data.status,
        requiredSigners: JSON.stringify(data.requiredSignerIds),
        digitalSignatures: JSON.stringify(Object.fromEntries(allowedSignatureEntries)),
        updatedAt: new Date(),
      })
      .where(eq(agreements.id, data.id))
      .returning()

    const allUsers = await db.select().from(users)
    return enrichAgreement(updated[0], allUsers)
  })

export const addAgreementSignatureFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ agreementId: z.number() }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireStaffUser()
    const current = await db.select().from(agreements).where(eq(agreements.id, data.agreementId)).limit(1)
    if (!current[0]) {
      throw new Error('Agreement not found')
    }

    const signerIds: number[] = JSON.parse(current[0].requiredSigners || '[]')
    if (!signerIds.includes(currentUser.id)) {
      throw new Error('You are not a required signer')
    }

    const digitalSignatures: Record<string, boolean> = JSON.parse(current[0].digitalSignatures || '{}')
    digitalSignatures[currentUser.id] = true

    const updated = await db.update(agreements)
      .set({
        digitalSignatures: JSON.stringify(digitalSignatures),
        updatedAt: new Date(),
      })
      .where(eq(agreements.id, data.agreementId))
      .returning()

    const allUsers = await db.select().from(users)
    return enrichAgreement(updated[0], allUsers)
  })

export const markAgreementPhysicalFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    await requireOrganizerUser()
    const updated = await db.update(agreements)
      .set({
        physicalSigned: true,
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(agreements.id, data.id))
      .returning()

    const allUsers = await db.select().from(users)
    return enrichAgreement(updated[0], allUsers)
  })

export const recordAgreementPdfGenerationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireStaffUser()
    const updated = await db.update(agreements)
      .set({
        generatedAt: new Date(),
        generatedBy: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(agreements.id, data.id))
      .returning()

    const allUsers = await db.select().from(users)
    return enrichAgreement(updated[0], allUsers)
  })