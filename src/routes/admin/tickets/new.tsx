import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getEventsFn, issueTicketFn } from '../../../server/functions/tickets'
import { getAllTicketTypesFn, getAllEventTicketTypesFn } from '../../../server/functions/eventTicketTypes'
import { useState } from 'react'
import {
  Ticket,
  Save,
  ArrowLeft,
  CheckCircle,
  Mail,
  User,
  Calendar,
  Tag,
  Plus,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/admin/tickets/new')({
  loader: async () => {
    const [events, ticketTypes, eventTicketTypes] = await Promise.all([
      getEventsFn(),
      getAllTicketTypesFn(),
      getAllEventTicketTypesFn(),
    ])
    return { events, ticketTypes, eventTicketTypes }
  },
  component: NewTicket,
})

type SuccessInfo = {
  code: string
  email: string
  name: string
  eventTitle: string
  typeName: string
  pricePaid: number
}

function NewTicket() {
  const { events, ticketTypes, eventTicketTypes } = Route.useLoaderData()
  const navigate = useNavigate()

  const defaultForm = {
    eventId: '',
    ticketTypeId: '',
    participantName: '',
    participantEmail: '',
    pricePaid: '',
  }
  const [form, setForm] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessInfo | null>(null)
  const [error, setError] = useState('')

  // Only show published, non-finished events
  const activeEvents = events.filter((e) => !e.finished)

  // Ticket types available for the selected event
  const getAvailableTypes = (eventId: string) => {
    if (!eventId) return ticketTypes
    const eid = parseInt(eventId)
    const configured = eventTicketTypes.filter((ett) => ett.eventId === eid && ett.enabled)
    if (configured.length === 0) return ticketTypes // Fall back to all if none configured
    const configuredIds = new Set(configured.map((c) => c.ticketTypeId))
    return ticketTypes.filter((tt) => configuredIds.has(tt.id))
  }

  const availableTypes = getAvailableTypes(form.eventId)
  const selectedType = ticketTypes.find((tt) => tt.id === parseInt(form.ticketTypeId))
  const selectedEvent = events.find((e) => e.id === parseInt(form.eventId))

  const handleEventChange = (eventId: string) => {
    setForm((prev) => ({ ...prev, eventId, ticketTypeId: '', pricePaid: '' }))
  }

  const handleTypeChange = (ticketTypeId: string) => {
    const tt = ticketTypes.find((t) => t.id === parseInt(ticketTypeId))
    setForm((prev) => ({
      ...prev,
      ticketTypeId,
      pricePaid: tt ? String(tt.price) : prev.pricePaid,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.eventId || !form.participantName || !form.participantEmail) return
    setIsSubmitting(true)
    setError('')
    try {
      const result = await issueTicketFn({
        data: {
          eventId: parseInt(form.eventId),
          participantName: form.participantName.trim(),
          participantEmail: form.participantEmail.trim().toLowerCase(),
          ticketType: selectedType?.name || 'Standard',
          pricePaid: form.pricePaid !== '' ? parseInt(form.pricePaid) : 0,
        },
      })
      setSuccess({
        code: result.ticketCode,
        email: form.participantEmail.trim().toLowerCase(),
        name: form.participantName.trim(),
        eventTitle: selectedEvent?.title || '',
        typeName: selectedType?.name || 'Standard',
        pricePaid: form.pricePaid !== '' ? parseInt(form.pricePaid) : 0,
      })
      // Keep event selected, reset the rest for quick multi-issue
      setForm((prev) => ({
        ...defaultForm,
        eventId: prev.eventId,
      }))
    } catch (err: any) {
      setError(err?.message || 'Kunde inte utfärda biljett.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    form.eventId &&
    form.participantName.trim() &&
    form.participantEmail.trim() &&
    form.participantEmail.includes('@')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Biljetter</p>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary" />
              Utfärda Biljett
            </h1>
            <p className="text-muted-foreground mt-2">
              Biljetten skapas och en bekräftelse skickas direkt till deltagaren via e-post.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: '/admin/tickets' })}
            className="px-4 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-wider font-medium hover:text-foreground hover:border-primary/50 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka
          </button>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 border border-green-300 flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 mb-1">Biljett utfärdad!</p>
              <div className="space-y-0.5 text-xs text-green-700">
                <p className="flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  <span className="font-mono font-bold">{success.code}</span>
                  <span className="text-green-600">— {success.typeName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {success.name}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  E-postbekräftelse skickad till <strong>{success.email}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {success.eventTitle} — {success.pricePaid} SEK
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSuccess(null)}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs uppercase tracking-wider font-medium hover:bg-green-700 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Ny biljett
                </button>
                <button
                  onClick={() => navigate({ to: '/admin/tickets' })}
                  className="px-3 py-1.5 border border-green-300 text-green-700 text-xs uppercase tracking-wider font-medium hover:bg-green-100 transition-all"
                >
                  Visa alla biljetter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Biljettinformation</span>
        </div>

        {/* Event selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-3 h-3 text-primary" />
            Event *
          </label>
          <select
            value={form.eventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
            required
          >
            <option value="">Välj event...</option>
            {activeEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} —{' '}
                {new Date(event.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                {event.published ? '' : ' (Opublicerat)'}
              </option>
            ))}
            {activeEvents.length === 0 && (
              <option disabled value="">Inga aktiva event</option>
            )}
          </select>
        </div>

        {/* Ticket type selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-2">
            <Tag className="w-3 h-3 text-primary" />
            Biljettyp *
          </label>
          <select
            value={form.ticketTypeId}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
            required
            disabled={!form.eventId && ticketTypes.length === 0}
          >
            <option value="">Välj biljettyp...</option>
            {availableTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name} — {tt.price} SEK
                {tt.description ? ` (${tt.description})` : ''}
              </option>
            ))}
            {availableTypes.length === 0 && (
              <option disabled value="">Inga biljettyper tillgängliga</option>
            )}
          </select>
          {form.eventId && availableTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Inga biljettyper konfigurerade för detta event.{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/admin/tickets/events' })}
                className="text-primary hover:underline"
              >
                Konfigurera i Events
              </button>
            </p>
          )}
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-primary" />
            <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Deltagare</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Participant name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <User className="w-3 h-3 text-primary" />
                Namn *
              </label>
              <input
                type="text"
                placeholder="Anna Andersson"
                value={form.participantName}
                onChange={(e) => setForm((prev) => ({ ...prev, participantName: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Participant email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" />
                E-post *
              </label>
              <input
                type="email"
                placeholder="anna@example.se"
                value={form.participantEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, participantEmail: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-primary" />
            <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Pris</span>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <label className="text-xs font-medium text-foreground">Pris betalt (SEK)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder={selectedType ? String(selectedType.price) : '0'}
                value={form.pricePaid}
                onChange={(e) => setForm((prev) => ({ ...prev, pricePaid: e.target.value }))}
                className="w-full p-3 pr-12 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
              <span className="absolute right-3 top-3 text-sm text-muted-foreground">SEK</span>
            </div>
            {selectedType && form.pricePaid === '' && (
              <p className="text-xs text-muted-foreground">
                Standardpris: {selectedType.price} SEK. Lämna tomt för att använda standardpriset.
              </p>
            )}
          </div>
        </div>

        {/* Info about email */}
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20">
          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            En bekräftelse med biljettkod och QR-kod skickas automatiskt till deltagarens e-postadress direkt när
            biljetten utfärdas.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full px-4 py-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Utfärdar biljett...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Utfärda biljett & skicka e-post
            </>
          )}
        </button>
      </form>
    </div>
  )
}
