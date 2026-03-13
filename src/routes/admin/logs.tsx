import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { getSessionFn } from '../../server/functions/auth'
import { getActivityLogsFn } from '../../server/functions/logs'

export const Route = createFileRoute('/admin/logs')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    if (!user || user.role !== 'organizer') {
      throw redirect({ to: '/admin' })
    }
  },
  loader: async () => {
    try {
      const logs = await getActivityLogsFn({ data: { limit: 400 } })
      return { logs }
    } catch (error) {
      console.error('Failed to load activity logs', error)
      return { logs: [] }
    }
  },
  component: AdminLogs,
})

function AdminLogs() {
  const { logs } = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'organizer' | 'volunteer'>('all')

  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return logs.filter((log) => {
      if (roleFilter !== 'all' && log.actorRole !== roleFilter) {
        return false
      }

      if (!normalized) {
        return true
      }

      const parsedDetails = parseDetails(log.details)
      const pieces = [
        log.action,
        log.entityType,
        String(log.entityId ?? ''),
        String(log.actorUserId),
        log.actorRole,
        log.actorName || '',
        log.actorEmail || '',
        JSON.stringify(parsedDetails ?? {}),
      ]

      return pieces.some((piece) => piece.toLowerCase().includes(normalized))
    })
  }, [logs, query, roleFilter])

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-5 sm:p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />

      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Granskning</p>
        <h2 className="font-display text-2xl sm:text-3xl tracking-wide mb-2">Aktivitetslogg</h2>
        <p className="text-xs text-[#F0E8D8]/50">Visar viktiga åtgärder utförda av administratörer och volontärer.</p>
      </div>

      <div className="mb-6 p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          type="text"
          placeholder="Sök på användare, handling eller objekt..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all placeholder:text-[#F0E8D8]/30"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'organizer' | 'volunteer')}
          className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm uppercase tracking-[0.1em]"
        >
          <option value="all">Alla roller</option>
          <option value="organizer">Endast organizer</option>
          <option value="volunteer">Endast volunteer</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const details = parseDetails(log.details)
          const requestMeta = (details as { _request?: { ip?: string | null } } | null)?._request

          return (
          <div key={log.id} className="p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#C04A2A] mb-1">{log.action}</p>
                <p className="text-sm text-[#F0E8D8]">
                  {log.actorName || 'Okänd användare'} ({log.actorRole}) · {log.entityType}
                  {log.entityId ? ` #${log.entityId}` : ''}
                </p>
                <p className="text-xs text-[#F0E8D8]/45 mt-1">ID {log.actorUserId}{log.actorEmail ? ` · ${log.actorEmail}` : ''}</p>
                {requestMeta?.ip && (
                  <p className="text-xs text-[#F0E8D8]/45 mt-1">IP {requestMeta.ip}</p>
                )}
              </div>
              <p className="text-xs text-[#F0E8D8]/50 whitespace-nowrap">
                {log.createdAt ? new Date(log.createdAt).toLocaleString('sv-SE') : ''}
              </p>
            </div>
              {details && (
              <pre className="mt-3 p-3 bg-[#100E0C] border border-[#C04A2A]/20 rounded-sm text-[11px] text-[#F0E8D8]/75 overflow-x-auto">
                  {JSON.stringify(details, null, 2)}
              </pre>
            )}
          </div>
        )})}

        {filteredLogs.length === 0 && (
          <div className="text-center py-10 text-[#F0E8D8]/50 border border-dashed border-[#C04A2A]/25 rounded-sm">
            Inga loggrader matchade din sökning.
          </div>
        )}
      </div>
    </div>
  )
}

function parseDetails(value: string | null) {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}
