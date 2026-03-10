'use server'

import { createServerFn } from '@tanstack/react-start'
import type {
  getPerformanceTestDetails,
  getPerformanceTestHistory,
} from '../lib/performance-core'
import { z } from 'zod'

type PerformanceHistoryEntry = Awaited<ReturnType<typeof getPerformanceTestHistory>>[number]
export type SerializablePerformanceHistoryEntry = Omit<
  PerformanceHistoryEntry,
  'results'
> & {
  results: { [key: string]: {} }
}

const toResultsRecord = (): { [key: string]: {} } => ({})

export const getPerformanceTestHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator((limit: unknown) => z.number().int().min(1).max(100).optional().parse(limit))
  .handler(async ({ data }) => {
    const { getPerformanceTestHistory } = await import('../lib/performance-core.js')
    const history = await getPerformanceTestHistory(data ?? 30)

    return history.map((test) => ({
      ...test,
      results: toResultsRecord(),
    })) satisfies SerializablePerformanceHistoryEntry[]
  })

export const getPerformanceTestDetailsFn = createServerFn({ method: 'GET' })
  .inputValidator((testId: unknown) => z.number().int().positive().parse(testId))
  .handler(async ({ data }) => {
    const { getPerformanceTestDetails } = await import('../lib/performance-core.js')
    const details = await getPerformanceTestDetails(data)

    if (!details) {
      return null
    }

    return details satisfies Awaited<ReturnType<typeof getPerformanceTestDetails>>
  })
