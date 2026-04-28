import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getEventsFn, issueTicketFn, getTicketTypesForEventFn } from '../../../server/functions/tickets'
import { useState, useEffect, useMemo } from 'react'
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
  Building2,
} from 'lucide-react'

export const Route = createFileRoute('/admin/tickets/new')({
  loader: async () => {
    const [events] = await Promise.all([
      getEventsFn(),
    ])
    return { events }
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
  const { events } = Route.useLoaderData()
  const navigate = useNavigate()

  const defaultForm = {
    eventId: '',
    ticketTypeId: '',
    participantName: '',
    participantEmail: '',
    participantCompany: '',
    pricePaid: '',
    issuanceType: 'private' as 'company' | 'private',
    ticketCount: 1,
    companyId: '',
  }
  const [form, setForm] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessInfo | null>(null)
  const [error, setError] = useState('')

  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [pricingRules, setPricingRules] = useState<any[]>([])
  const [isLoadingEventData, setIsLoadingEventData] = useState(false)

  const activeEvents = events.filter((e) => !e.finished)

  useEffect(() => {
    let isMounted = true
    async function loadEventData() {
      if (!form.eventId) {
        setTicketTypes([])
        setCompanies([])
        setPricingRules([])
        return
      }
      setIsLoadingEventData(true)
      try {
        const data = await getTicketTypesForEventFn({ data: parseInt(form.eventId) })
        if (isMounted) {
          setTicketTypes(data.ticketTypes || [])
          setCompanies(data.companies || [])
          setPricingRules(data.pricingRules || [])
        }
      } catch (err) {
        console.error('Failed to load event data', err)
      } finally {
        if (isMounted) {
          setIsLoadingEventData(false)
        }
      }
    }
    loadEventData()
    return () => { isMounted = false }
  }, [form.eventId])

  const selectedType = ticketTypes.find((tt) => tt.ticketTypeId === parseInt(form.ticketTypeId))
  const selectedEvent = events.find((e) => e.id === parseInt(form.eventId))
  const selectedCompany = companies.find((c) => c.id === parseInt(form.companyId))

  // Allow all ticket types for the event, regardless of company pricing rules
  const availableTicketTypes = useMemo(() => {
    return ticketTypes || []
  }, [ticketTypes])

  // Reset ticket type if it's no longer available after event change
  useEffect(() => {
    if (form.ticketTypeId) {
      const isAvailable = availableTicketTypes.some(tt => tt.ticketTypeId === parseInt(form.ticketTypeId))
      if (!isAvailable) {
        setForm(prev => ({ ...prev, ticketTypeId: '', pricePaid: '' }))
      }
    }
  }, [availableTicketTypes, form.ticketTypeId])

  const calculatePrice = (typeId: string, compId: string, issuanceType: string) => {
    if (!typeId) return ''
    const tt = ticketTypes.find((t) => t.ticketTypeId === parseInt(typeId))
    if (!tt) return ''

    if (issuanceType === 'company' && compId) {
      const rule = pricingRules.find(
        (r) => r.companyId === parseInt(compId) && r.ticketTypeId === parseInt(typeId)
      )
      if (rule) {
        return String(rule.price)
      }
    }
    return String(tt.price)
  }

  const handleEventChange = (eventId: string) => {
    setForm((prev) => ({ ...prev, eventId, ticketTypeId: '', pricePaid: '', companyId: '' }))
  }

  const handleTypeChange = (ticketTypeId: string) => {
    const newPrice = calculatePrice(ticketTypeId, form.companyId, form.issuanceType)
    setForm((prev) => ({
      ...prev,
      ticketTypeId,
      pricePaid: newPrice,
    }))
  }

  const handleIssuanceTypeChange = (issuanceType: 'company' | 'private') => {
    const newPrice = calculatePrice(form.ticketTypeId, form.companyId, issuanceType)
    setForm((prev) => ({
      ...prev,
      issuanceType,
      companyId: issuanceType === 'private' ? '' : prev.companyId,
      pricePaid: newPrice,
    }))
  }

  const handleCompanyChange = (companyId: string) => {
    const newPrice = calculatePrice(form.ticketTypeId, companyId, form.issuanceType)
    setForm((prev) => ({
      ...prev,
      companyId,
      pricePaid: newPrice,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.eventId || !form.participantName || !form.participantEmail || !form.ticketTypeId) return
    
    setIsSubmitting(true)
    setError('')
    try {
      const result = await issueTicketFn({
        data: {
          eventId: parseInt(form.eventId),
          participantName: form.participantName.trim(),
          participantEmail: form.participantEmail.trim().toLowerCase(),
          participantCompany: form.participantCompany.trim() || (selectedCompany?.name || undefined),
          ticketType: selectedType?.name || 'Standard',
          pricePaid: form.pricePaid !== '' ? parseInt(form.pricePaid) : 0,
          issuanceType: form.issuanceType,
          ticketCount: form.ticketCount,
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
    form.ticketTypeId &&
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

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Biljettinformation</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-3 h-3 text-primary" />
            Event *
          </label>
          <select
            name="eventId"
            value={form.eventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
            required
          >
            <option value="">Välj event...</option>
            {activeEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} {' '}
                {new Date(event.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                {event.published ? '' : ' (Opublicerat)'}
              </option>
            ))}
            {activeEvents.length === 0 && (
              <option disabled value="">Inga aktiva event</option>
            )}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-medium text-foreground flex items-center gap-2">
            <User className="w-3 h-3 text-primary" />
            Utfärdande typ
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="issuanceType"
                value="private"
                checked={form.issuanceType === 'private'}
                onChange={() => handleIssuanceTypeChange('private')}
              />
              Privatperson
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="issuanceType"
                value="company"
                checked={form.issuanceType === 'company'}
                onChange={() => handleIssuanceTypeChange('company')}
              />
              Företag
            </label>
          </div>
          
          {form.issuanceType === 'company' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-primary" />
                  Företag (Registrerat)
                </label>
                <select
                  name="companyId"
                  value={form.companyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
                  disabled={!form.eventId || isLoadingEventData}
                >
                  <option value="">
                    {!form.eventId 
                      ? 'Välj event först...' 
                      : isLoadingEventData 
                        ? 'Laddar...' 
                        : companies.length === 0 
                          ? 'Inga företag finns upplagda' 
                          : 'Välj företag (frivilligt)...'}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Antal biljetter</label>
                <input
                  type="number"
                  name="ticketCount"
                  min="1"
                  value={form.ticketCount}
                  onChange={(e) => setForm(prev => ({ ...prev, ticketCount: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-2">
            <Tag className="w-3 h-3 text-primary" />
            Biljettyp *
          </label>
          <select
            name="ticketTypeId"
            value={form.ticketTypeId}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all"
            required
            disabled={!form.eventId || isLoadingEventData || availableTicketTypes.length === 0}
          >
            <option value="">
              {!form.eventId 
                ? 'Välj event först...' 
                : isLoadingEventData 
                  ? 'Laddar...' 
                  : availableTicketTypes.length === 0 
                    ? 'Inga biljettyper tillgängliga' 
                    : 'Välj biljettyp...'}
            </option>
            {availableTicketTypes.map((tt) => (
              <option key={tt.ticketTypeId} value={tt.ticketTypeId}>
                {tt.name} — {calculatePrice(String(tt.ticketTypeId), form.companyId, form.issuanceType)} SEK
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-primary" />
            <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Deltagare</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <User className="w-3 h-3 text-primary" />
                Namn *
              </label>
              <input
                type="text"
                name="participantName"
                placeholder="Anna Andersson"
                value={form.participantName}
                onChange={(e) => setForm((prev) => ({ ...prev, participantName: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" />
                E-post *
              </label>
              <input
                type="email"
                name="participantEmail"
                placeholder="anna@example.se"
                value={form.participantEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, participantEmail: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-3 h-3 text-primary" />
                Organisation / Företag (Frivilligt)
              </label>
              <input
                type="text"
                name="participantCompany"
                placeholder="Ex. Företaget AB"
                value={form.participantCompany}
                onChange={(e) => setForm((prev) => ({ ...prev, participantCompany: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
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
                name="pricePaid"
                min="0"
                placeholder={selectedType ? calculatePrice(String(selectedType.ticketTypeId), form.companyId, form.issuanceType) : '0'}
                value={form.pricePaid}
                onChange={(e) => setForm((prev) => ({ ...prev, pricePaid: e.target.value }))}
                className="w-full p-3 pr-12 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
              <span className="absolute right-3 top-3 text-sm text-muted-foreground">SEK</span>
            </div>
            {selectedType && form.pricePaid === '' && (
              <p className="text-xs text-muted-foreground">
                Standardpris: {calculatePrice(String(selectedType.ticketTypeId), form.companyId, form.issuanceType)} SEK. Lämna tomt för att använda standardpriset.
              </p>
            )}
            {form.issuanceType === 'company' && form.companyId && form.ticketTypeId && form.pricePaid === '' && (
               <p className="text-xs text-primary">
                 Företagspris tillämpas automatiskt om en prisregel finns, annars används standardpriset.
               </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20">
          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            En bekräftelse med biljettkod och QR-kod skickas automatiskt till deltagarens e-postadress direkt när biljetten utfärdas.
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
