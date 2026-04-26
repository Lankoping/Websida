import { createFileRoute } from '@tanstack/react-router'
import { verifyTicketByCodeFn } from '../../server/functions/tickets'
import { getRelatedTicketsFn, markAllTicketsUsedFn } from '../../server/functions/scan'
import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  ShieldCheck,
  Loader2,
  Ticket,
  Users,
  CheckCheck,
} from 'lucide-react'

export const Route = createFileRoute('/verify/$code')({
  component: VerifyTicket,
})

type RelatedTicket = {
  id: number
  ticketCode: string
  ticketType: string
  status: string
  participantName: string
  pricePaid: number
  scannedAt: Date | string | null
  scannedByName: string | null
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'valid')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Giltig
      </span>
    )
  if (status === 'used')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-400">
        <CheckCircle className="w-3 h-3" />
        Incheckad
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400">
      <XCircle className="w-3 h-3" />
      Annullerad
    </span>
  )
}

function VerifyTicket() {
  const { code } = Route.useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relatedTickets, setRelatedTickets] = useState<RelatedTicket[]>([])
  const [markingAll, setMarkingAll] = useState(false)
  const [allMarked, setAllMarked] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await verifyTicketByCodeFn({ data: { code, markAsUsed: true } })
        setData(res)

        // Fetch sibling tickets if verification found a ticket
        if (res?.ticket) {
          try {
            const related = await getRelatedTicketsFn({
              data: {
                participantEmail: res.ticket.participantEmail,
                eventId: res.ticket.eventId,
              },
            })
            setRelatedTickets(related as RelatedTicket[])
          } catch {
            // Non-critical — ignore failures
          }
        }
      } catch (err) {
        console.error(err)
        setData({ success: false, message: 'Nätverksfel vid verifiering' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code])

  const handleMarkAll = async () => {
    if (!data?.ticket) return
    setMarkingAll(true)
    try {
      await markAllTicketsUsedFn({
        data: {
          participantEmail: data.ticket.participantEmail,
          eventId: data.ticket.eventId,
        },
      })
      // Refresh related tickets
      const updated = await getRelatedTicketsFn({
        data: {
          participantEmail: data.ticket.participantEmail,
          eventId: data.ticket.eventId,
        },
      })
      setRelatedTickets(updated as RelatedTicket[])
      setAllMarked(true)
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#100E0C] text-[#F0E8D8] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#C04A2A] animate-spin mb-4" />
        <p className="font-display text-xl tracking-wider">Verifierar biljett...</p>
      </div>
    )
  }

  const { success, ticket, event, message } = data

  const otherTickets = relatedTickets.filter((t) => t.ticketCode !== code)
  const pendingCount = relatedTickets.filter((t) => t.status === 'valid' && t.ticketCode !== code).length
  const hasMultiple = relatedTickets.length > 1

  return (
    <div className="min-h-screen bg-[#100E0C] text-[#F0E8D8] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C04A2A08_1px,transparent_1px),linear-gradient(to_bottom,#C04A2A08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative">
        {/* Main verification card */}
        <div
          className={`w-full p-8 border ${
            !success || (ticket?.status !== 'valid' && !data.checkingIn)
              ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_40px_rgba(239,68,68,0.1)]'
              : 'border-green-500/30 bg-green-500/5 shadow-[0_0_40px_rgba(34,197,94,0.1)]'
          } rounded-sm relative overflow-hidden text-center`}
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C04A2A]/20 to-transparent" />

          <div className="mb-6 flex justify-center">
            {success ? (
              ticket?.status === 'valid' || data.checkingIn ? (
                <div className="p-4 bg-green-500/20 rounded-full border border-green-500/40">
                  <ShieldCheck className="w-10 h-10 text-green-400" />
                </div>
              ) : ticket?.status === 'used' ? (
                <div className="p-4 bg-orange-500/20 rounded-full border border-orange-500/40">
                  <AlertTriangle className="w-10 h-10 text-orange-400" />
                </div>
              ) : (
                <div className="p-4 bg-red-500/20 rounded-full border border-red-500/40">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              )
            ) : (
              <div className="p-4 bg-red-500/20 rounded-full border border-red-500/40">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          <h1 className="font-display text-3xl tracking-wide mb-2">
            {success
              ? data.checkingIn
                ? 'Godkänd Incheckning'
                : ticket?.status === 'used'
                  ? 'Biljett Redan Använd'
                  : 'Biljett Ogiltig'
              : 'Ogiltig Kod'}
          </h1>
          <p className="text-[#F0E8D8]/50 text-xs font-mono uppercase tracking-[3px] mb-8">{code}</p>

          {success && ticket && (
            <div className="space-y-6 text-left border-t border-[#C04A2A]/10 pt-6">
              {data.scannedBy && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-[#C04A2A]/10 border border-[#C04A2A]/20 rounded-sm">
                  <ShieldCheck className="w-4 h-4 text-[#C04A2A]" />
                  <p className="text-[10px] uppercase tracking-widest text-[#F0E8D8]/60">
                    Skannad av: <span className="text-[#F0E8D8] font-bold">{data.scannedBy.name}</span>
                  </p>
                </div>
              )}
              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-[#C04A2A]/60 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C04A2A]/80 font-bold mb-1">Event</p>
                  <p className="text-lg font-medium">{event?.title || 'Okänt event'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <User className="w-5 h-5 text-[#C04A2A]/60 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C04A2A]/80 font-bold mb-1">Deltagare</p>
                  <p className="text-lg font-medium">{ticket.participantName}</p>
                  <p className="text-xs text-[#F0E8D8]/40">{ticket.participantEmail}</p>
                </div>
              </div>
            </div>
          )}

          {!success && <p className="text-sm text-red-400 mt-4">{message}</p>}

          <div className="mt-10">
            <a
              href="/"
              className="px-8 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-sm hover:translate-y-[-2px] active:translate-y-0 transition-all inline-block"
            >
              Hem till webbplatsen
            </a>
          </div>
        </div>

        {/* Related tickets panel */}
        {success && hasMultiple && (
          <div className="w-full border border-[#C04A2A]/20 bg-[#100E0C]/80 rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#C04A2A]/10 bg-[#C04A2A]/5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C04A2A]/70" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F0E8D8]/60">
                  Alla biljetter — {ticket.participantName}
                </p>
              </div>
              <span className="text-[10px] text-[#F0E8D8]/40 font-mono">{relatedTickets.length} st</span>
            </div>

            <div className="divide-y divide-[#C04A2A]/10">
              {relatedTickets.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-4 py-3 ${t.ticketCode === code ? 'bg-[#C04A2A]/8' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Ticket
                      className={`w-4 h-4 flex-shrink-0 ${t.ticketCode === code ? 'text-[#C04A2A]' : 'text-[#F0E8D8]/30'}`}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-[#F0E8D8]/80 flex items-center gap-1.5">
                        {t.ticketCode}
                        {t.ticketCode === code && (
                          <span className="text-[9px] text-[#C04A2A] font-bold uppercase tracking-wider">denna</span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#F0E8D8]/40 uppercase tracking-wider mt-0.5">{t.ticketType}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={t.status} />
                    {t.scannedAt && t.scannedByName && (
                      <p className="text-[9px] text-[#F0E8D8]/30">av {t.scannedByName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mark all button */}
            {pendingCount > 0 && !allMarked && (
              <div className="px-4 py-3 border-t border-[#C04A2A]/10 bg-[#C04A2A]/5">
                <button
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-600/30 disabled:opacity-50 transition-all rounded-sm"
                >
                  {markingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  {markingAll
                    ? 'Checkar in...'
                    : `Checka in alla återstående (${pendingCount})`}
                </button>
              </div>
            )}

            {(pendingCount === 0 || allMarked) && (
              <div className="px-4 py-3 border-t border-[#C04A2A]/10 bg-green-500/5 flex items-center justify-center gap-2">
                <CheckCheck className="w-4 h-4 text-green-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                  Alla biljetter incheckade
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
