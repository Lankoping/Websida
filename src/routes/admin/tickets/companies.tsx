import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Building2, Trash2, Save, X, Edit2, ChevronDown, ChevronRight, Tag, ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  getCompaniesFn,
  createCompanyFn,
  updateCompanyFn,
  deleteCompanyFn,
  getCompanyPricingFn,
  upsertCompanyPricingFn,
  deleteCompanyPricingFn,
} from '../../../server/functions/companies'
import { getAllTicketTypesFn } from '../../../server/functions/eventTicketTypes'

export const Route = createFileRoute('/admin/tickets/companies')({
  loader: async () => {
    const [companies, ticketTypes] = await Promise.all([getCompaniesFn(), getAllTicketTypesFn()])
    return { companies, ticketTypes }
  },
  component: CompaniesAdmin,
})

type PricingRow = {
  id: number
  companyId: number
  ticketTypeId: number
  thresholdQty: number
  priceBelow: number
  priceAbove: number
  ticketTypeName: string
  ticketTypePrice: number
}

type AddPricingForm = {
  ticketTypeId: string
  thresholdQty: string
  priceBelow: string
  priceAbove: string
}

const emptyAddForm: AddPricingForm = { ticketTypeId: '', thresholdQty: '', priceBelow: '', priceAbove: '' }

function CompaniesAdmin() {
  const { companies, ticketTypes } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()

  // Company form
  const defaultForm = { name: '', contactName: '', contactEmail: '', notes: '' }
  const [formData, setFormData] = useState(defaultForm)
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pricing panel state
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null)
  const [pricingCache, setPricingCache] = useState<Record<number, PricingRow[]>>({})
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [addForm, setAddForm] = useState<AddPricingForm>(emptyAddForm)
  const [showAddForm, setShowAddForm] = useState(false)
  const [savingPricing, setSavingPricing] = useState(false)

  const handleEdit = (company: (typeof companies)[0]) => {
    setEditingCompanyId(company.id)
    setFormData({
      name: company.name,
      contactName: company.contactName || '',
      contactEmail: company.contactEmail || '',
      notes: company.notes || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingCompanyId(null)
    setFormData(defaultForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setIsSubmitting(true)
    try {
      if (editingCompanyId) {
        await updateCompanyFn({ data: { id: editingCompanyId, ...formData } })
        setEditingCompanyId(null)
      } else {
        await createCompanyFn({ data: formData })
      }
      setFormData(defaultForm)
      await router.invalidate()
    } catch (err) {
      console.error(err)
      alert(`Kunde inte ${editingCompanyId ? 'uppdatera' : 'skapa'} företag.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Är du säker? Alla prisregler för företaget raderas också.')) {
      try {
        await deleteCompanyFn({ data: id })
        if (expandedCompanyId === id) setExpandedCompanyId(null)
        if (editingCompanyId === id) handleCancelEdit()
        await router.invalidate()
      } catch (err) {
        console.error(err)
        alert('Kunde inte radera företaget.')
      }
    }
  }

  const handleTogglePricing = async (companyId: number) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null)
      setShowAddForm(false)
      return
    }
    setExpandedCompanyId(companyId)
    setShowAddForm(false)
    setAddForm(emptyAddForm)
    if (!pricingCache[companyId]) {
      setLoadingPricing(true)
      try {
        const pricing = await getCompanyPricingFn({ data: companyId })
        setPricingCache((prev) => ({ ...prev, [companyId]: pricing as PricingRow[] }))
      } finally {
        setLoadingPricing(false)
      }
    }
  }

  const refreshPricing = async (companyId: number) => {
    const pricing = await getCompanyPricingFn({ data: companyId })
    setPricingCache((prev) => ({ ...prev, [companyId]: pricing as PricingRow[] }))
  }

  const handleAddPricing = async (companyId: number) => {
    if (!addForm.ticketTypeId || !addForm.thresholdQty || !addForm.priceBelow || !addForm.priceAbove) {
      alert('Fyll i alla fält.')
      return
    }
    setSavingPricing(true)
    try {
      await upsertCompanyPricingFn({
        data: {
          companyId,
          ticketTypeId: parseInt(addForm.ticketTypeId),
          thresholdQty: parseInt(addForm.thresholdQty),
          priceBelow: parseInt(addForm.priceBelow),
          priceAbove: parseInt(addForm.priceAbove),
        },
      })
      await refreshPricing(companyId)
      setAddForm(emptyAddForm)
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
      alert('Kunde inte spara prisregel.')
    } finally {
      setSavingPricing(false)
    }
  }

  const handleDeletePricing = async (pricingId: number, companyId: number) => {
    try {
      await deleteCompanyPricingFn({ data: pricingId })
      await refreshPricing(companyId)
    } catch (err) {
      console.error(err)
      alert('Kunde inte radera prisregel.')
    }
  }

  // Filter ticket types not yet assigned to this company's pricing
  const getAvailableTicketTypes = (companyId: number) => {
    const usedIds = new Set((pricingCache[companyId] || []).map((p) => p.ticketTypeId))
    return ticketTypes.filter((tt) => !usedIds.has(tt.id))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Biljetter</p>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Företag & Rabatter
            </h1>
            <p className="text-muted-foreground mt-2">
              Hantera företag och deras bulkrabatter per biljettyp.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className={`bg-card border p-6 space-y-5 sticky top-4 ${editingCompanyId ? 'border-primary shadow-sm shadow-primary/10' : 'border-border'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                <span className="text-[10px] font-medium tracking-widest text-primary uppercase">
                  {editingCompanyId ? 'Redigera företag' : 'Lägg till företag'}
                </span>
              </div>
              {editingCompanyId && (
                <button type="button" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Företagsnamn *</label>
              <input
                type="text"
                placeholder="AB Exempelföretaget"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kontaktperson</label>
              <input
                type="text"
                placeholder="Anna Andersson"
                value={formData.contactName}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">E-post</label>
              <input
                type="email"
                placeholder="kontakt@foretag.se"
                value={formData.contactEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Anteckningar</label>
              <textarea
                placeholder="Interna anteckningar..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all min-h-[80px] resize-y placeholder:text-muted-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
            >
              <Save className="w-4 h-4" />
              {editingCompanyId ? 'Uppdatera Företag' : 'Spara Företag'}
            </button>

            {/* Pricing info */}
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase mb-2">
                Hur bulkpriser fungerar
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ange ett tröskelantal per biljettyp. De första X biljetterna kostar <em>pris under tröskel</em>, resterande kostar{' '}
                <em>pris över tröskel</em>.
              </p>
              <div className="mt-2 p-2 bg-secondary border border-border text-xs text-muted-foreground font-mono">
                Exempel: 15 × 60 kr + 5 × 40 kr = 1 100 kr
              </div>
            </div>
          </form>
        </div>

        {/* Company List Column */}
        <div className="lg:col-span-2 space-y-3">
          {companies.map((company) => {
            const pricing = pricingCache[company.id] || []
            const isExpanded = expandedCompanyId === company.id
            const availableTypes = getAvailableTicketTypes(company.id)

            return (
              <div
                key={company.id}
                className={`bg-card border transition-all ${editingCompanyId === company.id ? 'border-primary shadow-sm shadow-primary/10' : 'border-border hover:border-primary/30'}`}
              >
                {/* Company row */}
                <div className="p-5 flex justify-between items-start group">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`p-3 flex-shrink-0 ${editingCompanyId === company.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-xl text-foreground truncate">{company.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {company.contactName && <span>{company.contactName}</span>}
                        {company.contactEmail && <span>{company.contactEmail}</span>}
                      </div>
                      {company.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">{company.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {/* Pricing toggle */}
                    <button
                      onClick={() => handleTogglePricing(company.id)}
                      className={`p-2 transition-all flex items-center gap-1 text-xs uppercase tracking-wider font-medium ${
                        isExpanded ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                      }`}
                      title="Hantera prisregler"
                    >
                      <Tag className="w-4 h-4" />
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        title="Redigera"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Radera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pricing panel */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-medium tracking-widest text-primary uppercase flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Prisregler per biljettyp
                      </p>
                      {availableTypes.length > 0 && (
                        <button
                          onClick={() => setShowAddForm((v) => !v)}
                          className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Lägg till regel
                        </button>
                      )}
                    </div>

                    {loadingPricing && !pricingCache[company.id] ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">Laddar...</div>
                    ) : (
                      <>
                        {/* Existing pricing rules */}
                        {pricing.length === 0 && !showAddForm && (
                          <div className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            Inga prisregler tillagda ännu.
                          </div>
                        )}

                        {pricing.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-3 py-1">
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Biljettyp</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-center w-20">Tröskel</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-center w-20">≤ Tröskel</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-center w-20">&gt; Tröskel</span>
                              <span className="w-7" />
                            </div>

                            {pricing.map((rule) => (
                              <div
                                key={rule.id}
                                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center bg-background border border-border px-3 py-2.5"
                              >
                                <div>
                                  <span className="text-sm font-medium text-foreground">{rule.ticketTypeName}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{rule.ticketTypePrice} SEK standard</span>
                                </div>
                                <div className="text-center w-20">
                                  <span className="text-sm text-foreground font-mono">{rule.thresholdQty}</span>
                                  <span className="text-[10px] text-muted-foreground block">st</span>
                                </div>
                                <div className="text-center w-20">
                                  <span className="text-sm text-foreground font-mono">{rule.priceBelow}</span>
                                  <span className="text-[10px] text-muted-foreground block">kr/st</span>
                                </div>
                                <div className="text-center w-20">
                                  <span className="text-sm text-foreground font-mono">{rule.priceAbove}</span>
                                  <span className="text-[10px] text-muted-foreground block">kr/st</span>
                                </div>
                                <button
                                  onClick={() => handleDeletePricing(rule.id, company.id)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-7 flex items-center justify-center"
                                  title="Radera prisregel"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add pricing rule form */}
                        {showAddForm && availableTypes.length > 0 && (
                          <div className="border border-primary/30 bg-primary/5 p-4 space-y-3">
                            <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
                              Ny prisregel
                            </p>

                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Biljettyp
                              </label>
                              <select
                                value={addForm.ticketTypeId}
                                onChange={(e) => setAddForm((prev) => ({ ...prev, ticketTypeId: e.target.value }))}
                                className="w-full p-2.5 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm"
                              >
                                <option value="">Välj biljettyp...</option>
                                {availableTypes.map((tt) => (
                                  <option key={tt.id} value={tt.id}>
                                    {tt.name} ({tt.price} SEK standard)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Tröskelantal
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="15"
                                  value={addForm.thresholdQty}
                                  onChange={(e) => setAddForm((prev) => ({ ...prev, thresholdQty: e.target.value }))}
                                  className="w-full p-2.5 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Pris ≤ tröskel (kr)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="60"
                                  value={addForm.priceBelow}
                                  onChange={(e) => setAddForm((prev) => ({ ...prev, priceBelow: e.target.value }))}
                                  className="w-full p-2.5 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Pris &gt; tröskel (kr)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="40"
                                  value={addForm.priceAbove}
                                  onChange={(e) => setAddForm((prev) => ({ ...prev, priceAbove: e.target.value }))}
                                  className="w-full p-2.5 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddPricing(company.id)}
                                disabled={savingPricing}
                                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
                              >
                                <Save className="w-3 h-3" />
                                {savingPricing ? 'Sparar...' : 'Spara regel'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddForm(false)
                                  setAddForm(emptyAddForm)
                                }}
                                className="px-4 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-widest font-medium hover:text-foreground transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        {availableTypes.length === 0 && pricing.length > 0 && (
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Alla biljettyper har prisregler tillagda.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {companies.length === 0 && (
            <div className="bg-card border border-dashed border-border p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Inga företag tillagda än.</p>
              <p className="text-sm text-muted-foreground mt-1">Använd formuläret till vänster för att lägga till ett företag.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
