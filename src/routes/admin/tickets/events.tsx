import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  getEventsFn,
  createEventFn,
  deleteEventFn,
  updateEventStatusFn,
  updateEventFn,
} from '../../../server/functions/tickets'
import { getAllTicketTypesFn, getAllEventTicketTypesFn, setEventTicketTypeFn } from '../../../server/functions/eventTicketTypes'
import { useState } from 'react'
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Save,
  ArrowLeft,
  MapPin,
  CheckCircle,
  Edit2,
  X,
  Ticket,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tickets/events')({
  loader: async () => {
    const [events, ticketTypes, allEventTicketTypes] = await Promise.all([
      getEventsFn(),
      getAllTicketTypesFn(),
      getAllEventTicketTypesFn(),
    ])
    return { events, ticketTypes, allEventTicketTypes }
  },
  component: EventsAdmin,
})

type TicketTypeConfig = {
  enabled: boolean
  maxQuantity: string
}

function EventsAdmin() {
  const { events, ticketTypes, allEventTicketTypes } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Ticket type config state
  const [ticketTypeEventId, setTicketTypeEventId] = useState<number | null>(null)
  const [localConfig, setLocalConfig] = useState<Record<number, TicketTypeConfig>>({})
  const [savingTicketConfig, setSavingTicketConfig] = useState(false)

  const defaultFormData = {
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    published: false,
    finished: false,
  }

  const [formData, setFormData] = useState(defaultFormData)

  const handleEdit = (event: (typeof events)[0]) => {
    setEditingId(event.id)
    const eventDate = new Date(event.date)
    const formattedDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setFormData({
      title: event.title,
      description: event.description || '',
      date: formattedDate,
      location: event.location || '',
      image: event.image || '',
      published: event.published,
      finished: event.finished,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(defaultFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateEventFn({ data: { id: editingId, ...formData } })
        setEditingId(null)
      } else {
        await createEventFn({ data: formData })
      }
      setFormData(defaultFormData)
      await router.invalidate()
    } catch (err) {
      console.error(err)
      alert(`Kunde inte ${editingId ? 'uppdatera' : 'skapa'} event.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Är du säker på att du vill radera detta event?')) {
      try {
        await deleteEventFn({ data: id })
        if (editingId === id) handleCancelEdit()
        if (ticketTypeEventId === id) setTicketTypeEventId(null)
        await router.invalidate()
      } catch (err) {
        console.error(err)
        alert('Kunde inte radera event.')
      }
    }
  }

  const handleToggleFinished = async (id: number, currentStatus: boolean) => {
    try {
      await updateEventStatusFn({ data: { eventId: id, finished: !currentStatus } })
      await router.invalidate()
    } catch (err) {
      console.error(err)
      alert('Kunde inte uppdatera eventets status.')
    }
  }

  const handleOpenTicketTypes = (eventId: number) => {
    if (ticketTypeEventId === eventId) {
      setTicketTypeEventId(null)
      return
    }
    setTicketTypeEventId(eventId)
    const init: Record<number, TicketTypeConfig> = {}
    ticketTypes.forEach((tt) => {
      const existing = allEventTicketTypes.find((e) => e.eventId === eventId && e.ticketTypeId === tt.id)
      init[tt.id] = {
        enabled: existing?.enabled ?? false,
        maxQuantity: existing?.maxQuantity != null ? String(existing.maxQuantity) : '',
      }
    })
    setLocalConfig(init)
  }

  const handleSaveTicketTypeConfig = async (eventId: number) => {
    setSavingTicketConfig(true)
    try {
      for (const [tidStr, cfg] of Object.entries(localConfig)) {
        const ticketTypeId = parseInt(tidStr)
        await setEventTicketTypeFn({
          data: {
            eventId,
            ticketTypeId,
            enabled: cfg.enabled,
            maxQuantity: cfg.maxQuantity !== '' ? parseInt(cfg.maxQuantity) : null,
          },
        })
      }
      await router.invalidate()
      // Re-open to reflect saved data
      setTicketTypeEventId(null)
    } catch (err) {
      console.error(err)
      alert('Kunde inte spara biljettyper.')
    } finally {
      setSavingTicketConfig(false)
    }
  }

  const getEventTicketTypeSummary = (eventId: number) => {
    const configured = allEventTicketTypes.filter((e) => e.eventId === eventId && e.enabled)
    return configured.length
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Biljetter</p>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Hantera Events
            </h1>
            <p className="text-muted-foreground mt-2">Skapa och konfigurera events att sälja biljetter till.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className={`bg-card border p-6 space-y-5 sticky top-4 ${editingId ? 'border-primary shadow-sm shadow-primary/10' : 'border-border'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                <span className="text-[10px] font-medium tracking-widest text-primary uppercase">
                  {editingId ? 'Redigera event' : 'Skapa nytt event'}
                </span>
              </div>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Titel *</label>
              <input
                type="text"
                placeholder="Namn på eventet"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Datum & Tid *</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" /> Plats
              </label>
              <input
                type="text"
                placeholder="Eventets adress/lokal"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Beskrivning</label>
              <textarea
                placeholder="Vad handlar eventet om?"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all min-h-[100px] resize-y placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="published" className="text-sm text-muted-foreground">
                Publicera direkt
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="finished"
                checked={formData.finished}
                onChange={(e) => setFormData((prev) => ({ ...prev, finished: e.target.checked }))}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="finished" className="text-sm text-muted-foreground">
                Markera som avslutat
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Uppdatera Event' : 'Spara Event'}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-card border transition-all ${editingId === event.id ? 'border-primary shadow-sm shadow-primary/10' : 'border-border hover:border-primary/30'}`}
            >
              {/* Event row */}
              <div className="p-5 flex justify-between items-center group">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`p-3 flex-shrink-0 ${editingId === event.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-display text-xl text-foreground truncate">{event.title}</h4>
                      {event.published ? (
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 uppercase font-bold tracking-wider">
                          Live
                        </span>
                      ) : (
                        <span className="text-[9px] bg-secondary text-muted-foreground px-2 py-0.5 uppercase font-bold tracking-wider">
                          Utkast
                        </span>
                      )}
                      {event.finished && (
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Avslutat
                        </span>
                      )}
                      {getEventTicketTypeSummary(event.id) > 0 && (
                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
                          <Ticket className="w-3 h-3" /> {getEventTicketTypeSummary(event.id)} typ
                          {getEventTicketTypeSummary(event.id) !== 1 ? 'er' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('sv-SE')} {' '}
                        {new Date(event.date).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {/* Ticket type config toggle */}
                  <button
                    onClick={() => handleOpenTicketTypes(event.id)}
                    className={`p-2 transition-all flex items-center gap-1 text-xs uppercase tracking-wider font-medium ${
                      ticketTypeEventId === event.id
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                    title="Konfigurera biljettyper"
                  >
                    <Ticket className="w-4 h-4" />
                    {ticketTypeEventId === event.id ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFinished(event.id, event.finished)}
                    className={`p-2 transition-all flex items-center gap-1 text-xs uppercase tracking-wider font-medium ${
                      event.finished
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={event.finished ? 'Markera som pågående' : 'Markera som avslutat'}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1 transition-opacity">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      title="Redigera"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="Radera"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticket type config panel */}
              {ticketTypeEventId === event.id && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <p className="text-[10px] font-medium tracking-widest text-primary uppercase mb-3 flex items-center gap-2">
                    <Ticket className="w-3 h-3" />
                    Biljettyper för detta event
                  </p>

                  {ticketTypes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border">
                      Inga biljettyper skapade ännu.{' '}
                      <button
                        onClick={() => navigate({ to: '/admin/tickets/types' })}
                        className="text-primary hover:underline"
                      >
                        Skapa biljettyper
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {ticketTypes.map((tt) => {
                          const cfg = localConfig[tt.id] || { enabled: false, maxQuantity: '' }
                          return (
                            <div
                              key={tt.id}
                              className={`flex items-center gap-3 p-3 border transition-all ${cfg.enabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'}`}
                            >
                              <input
                                type="checkbox"
                                id={`tt-${event.id}-${tt.id}`}
                                checked={cfg.enabled}
                                onChange={(e) =>
                                  setLocalConfig((prev) => ({
                                    ...prev,
                                    [tt.id]: { ...cfg, enabled: e.target.checked },
                                  }))
                                }
                                className="accent-primary w-4 h-4 flex-shrink-0"
                              />
                              <label
                                htmlFor={`tt-${event.id}-${tt.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <span className="text-sm font-medium text-foreground">{tt.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">{tt.price} SEK</span>
                                {tt.description && (
                                  <span className="text-xs text-muted-foreground ml-2">— {tt.description}</span>
                                )}
                              </label>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Max:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={cfg.maxQuantity}
                                  onChange={(e) =>
                                    setLocalConfig((prev) => ({
                                      ...prev,
                                      [tt.id]: { ...cfg, maxQuantity: e.target.value },
                                    }))
                                  }
                                  placeholder="∞"
                                  disabled={!cfg.enabled}
                                  className="w-20 p-1.5 bg-background border border-border text-sm text-center text-foreground focus:border-primary/50 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => handleSaveTicketTypeConfig(event.id)}
                        disabled={savingTicketConfig}
                        className="w-full px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
                      >
                        <Save className="w-3 h-3" />
                        {savingTicketConfig ? 'Sparar...' : 'Spara biljettyper'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {events.length === 0 && (
            <div className="bg-card border border-dashed border-border p-12 text-center">
              <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Inga event skapade än.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
