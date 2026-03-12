import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getAvgangRequestsFn, createAvgangRequestFn, updateAvgangStatusFn, generateAvgangPdfFn } from '../../server/functions/avgang'
import { useState } from 'react'

export const Route = createFileRoute('/admin/avgang')({
  loader: async () => {
    return { requests: await getAvgangRequestsFn() }
  },
  component: AvgangAdmin,
})

function AvgangAdmin() {
  const { requests: initialRequests } = Route.useLoaderData()
  const router = useRouter()
  
  // Form state
  const [namn, setNamn] = useState('')
  const [pnr, setPnr] = useState('')
  const [roll, setRoll] = useState('')
  const [orsak, setOrsak] = useState('')
  const [datum, setDatum] = useState('')
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [formError, setFormError] = useState('')
  const [requests, setRequests] = useState(initialRequests)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    if (!namn || !pnr || !roll || !orsak || !datum) {
      setFormError('Alla fält är obligatoriska')
      return
    }

    setIsSubmitting(true)
    try {
      const newRequest = await createAvgangRequestFn({
        data: { namn, pnr, roll, orsak, datum }
      })
      setRequests([newRequest, ...requests])
      
      // Reset form
      setNamn('')
      setPnr('')
      setRoll('')
      setOrsak('')
      setDatum('')
      
      setSubmissionSuccess(true)
      setTimeout(() => setSubmissionSuccess(false), 3000)
      await router.invalidate()
    } catch (err: any) {
      setFormError(err?.message || 'Kunde inte skapa avgångsbegäran')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected' | 'archived') => {
    try {
      const updated = await updateAvgangStatusFn({ data: { id, status: newStatus } })
      setRequests(requests.map(r => r.id === id ? updated : r))
      await router.invalidate()
    } catch (err: any) {
      alert('Kunde inte uppdatera status: ' + err?.message)
    }
  }

  const handleGeneratePdf = async (id: number) => {
    try {
      const result = await generateAvgangPdfFn({ data: { id } })
      // I produktion skulle detta ladda ner eller öppna PDF
      alert('PDF genererad!\n\n' + result.pdf)
    } catch (err: any) {
      alert('Kunde inte generera PDF: ' + err?.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'archived':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-3xl tracking-wide text-[#F0E8D8] mb-2">Avgångar</h2>
        <p className="text-[#F0E8D8]/60 text-sm">Hantera avgångsbegäran och generera PDF-dokument</p>
      </div>

      {/* Form section */}
      <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-6 rounded-sm mb-8">
        <h3 className="font-display text-lg tracking-wide text-[#F0E8D8] mb-6">Ny avgångsbegäran</h3>

        {submissionSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-sm">
            ✓ Avgångsbegäran registrerad
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Namn"
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            className="p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/30"
          />
          <input
            type="text"
            placeholder="Personnummer (YYYYMMDD-XXXX)"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            className="p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/30"
          />
          <input
            type="text"
            placeholder="Roll (t.ex. Ordförande, Sekreterare)"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            className="p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/30"
          />
          <input
            type="date"
            placeholder="Avgångsdatum"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm"
          />
          <textarea
            placeholder="Anledning till avgång"
            value={orsak}
            onChange={(e) => setOrsak(e.target.value)}
            className="md:col-span-2 p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm h-20 resize-none placeholder:text-[#F0E8D8]/30"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(192,74,42,0.3)]"
          >
            {isSubmitting ? 'Skickar...' : 'Registrera avgång'}
          </button>
        </form>
      </div>

      {/* Requests list */}
      <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-6 rounded-sm">
        <h3 className="font-display text-lg tracking-wide text-[#F0E8D8] mb-6">Avgångsbegäran ({requests.length})</h3>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-[#F0E8D8]/50">
            <p className="font-serif italic">Inga avgångsbegäran än</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm overflow-hidden"
              >
                {/* Header - always visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-[#1C1A18] transition-colors flex justify-between items-center"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-[#F0E8D8]">{req.namn}</span>
                      <span className={`text-[9px] font-medium uppercase tracking-[0.2em] px-2 py-1 border rounded-sm ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[#F0E8D8]/60 text-sm">
                      <span>{req.roll}</span> • <span className="font-mono">{req.pnr}</span>
                    </div>
                  </div>
                  <span className="text-[#F0E8D8]/40 ml-4">{expandedId === req.id ? '▼' : '▶'}</span>
                </div>

                {/* Details - expanded */}
                {expandedId === req.id && (
                  <div className="bg-[#141210]/50 border-t border-[#C04A2A]/20 p-4 space-y-4">
                    <div>
                      <p className="text-[#F0E8D8]/60 text-[11px] uppercase tracking-[0.15em] mb-2">Anledning</p>
                      <p className="text-[#F0E8D8] text-sm leading-relaxed">{req.orsak}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#F0E8D8]/60 text-[11px] uppercase tracking-[0.15em] mb-1">Avgångsdatum</p>
                        <p className="text-[#F0E8D8] text-sm">{req.datum ? new Date(req.datum).toLocaleDateString('sv-SE') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#F0E8D8]/60 text-[11px] uppercase tracking-[0.15em] mb-1">Registrerad</p>
                        <p className="text-[#F0E8D8] text-sm">{new Date(req.createdAt!).toLocaleDateString('sv-SE')}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#C04A2A]/20">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(req.id, 'approved')}
                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase tracking-[0.1em] font-medium rounded-sm hover:bg-green-500/30 transition-colors"
                          >
                            Godkänn
                          </button>
                          <button
                            onClick={() => handleStatusChange(req.id, 'rejected')}
                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase tracking-[0.1em] font-medium rounded-sm hover:bg-red-500/30 transition-colors"
                          >
                            Avslå
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleGeneratePdf(req.id)}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase tracking-[0.1em] font-medium rounded-sm hover:bg-blue-500/30 transition-colors"
                        >
                          ↓ Generera PDF
                        </button>
                      )}

                      {(req.status === 'approved' || req.status === 'rejected') && (
                        <button
                          onClick={() => handleStatusChange(req.id, 'archived')}
                          className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] uppercase tracking-[0.1em] font-medium rounded-sm hover:bg-gray-500/30 transition-colors ml-auto"
                        >
                          Arkivera
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
