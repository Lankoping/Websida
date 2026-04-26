import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getTicketTypesFn, createTicketTypeFn, deleteTicketTypeFn } from '../../../server/functions/tickets'
import { useState } from 'react'
import { Tag, Plus, Trash2, Save, ArrowLeft, X, Edit2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tickets/types')({
  loader: async () => {
    return await getTicketTypesFn()
  },
  component: TicketTypesAdmin,
})

function TicketTypesAdmin() {
  const ticketTypes = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()

  const defaultForm = { name: '', price: '', description: '' }
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.price === '') return
    setIsSubmitting(true)
    try {
      await createTicketTypeFn({
        data: {
          name: formData.name.trim(),
          price: parseInt(formData.price),
          description: formData.description.trim() || undefined,
        },
      })
      setFormData(defaultForm)
      await router.invalidate()
    } catch (err) {
      console.error(err)
      alert('Kunde inte skapa biljettyp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Radera biljettypen "${name}"? Detta kan inte ångras.`)) {
      try {
        await deleteTicketTypeFn({ data: id })
        await router.invalidate()
      } catch (err) {
        console.error(err)
        alert('Kunde inte radera biljettypen.')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Biljetter</p>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
              <Tag className="w-8 h-8 text-primary" />
              Biljetttyper
            </h1>
            <p className="text-muted-foreground mt-2">Definiera typer av biljetter med standardpris.</p>
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
        {/* Form column */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-primary" />
              <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Ny biljettyp</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Namn *</label>
              <input
                type="text"
                placeholder="t.ex. Standard, VIP, Barn"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Standardpris (SEK) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full p-3 pr-12 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                  required
                />
                <span className="absolute right-3 top-3 text-sm text-muted-foreground">SEK</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Beskrivning</label>
              <input
                type="text"
                placeholder="Valfri beskrivning"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Skapar...' : 'Skapa biljettyp'}
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2 space-y-3">
          {ticketTypes.map((tt) => (
            <div
              key={tt.id}
              className="bg-card border border-border p-5 flex justify-between items-center group hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 bg-primary/10 text-primary flex-shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-xl text-foreground">{tt.name}</h4>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono text-sm text-primary font-medium">{tt.price} SEK</span>
                    {tt.description && (
                      <span className="text-xs text-muted-foreground">{tt.description}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Skapad {tt.createdAt ? new Date(tt.createdAt).toLocaleDateString('sv-SE') : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <button
                  onClick={() => handleDelete(tt.id, tt.name)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Radera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {ticketTypes.length === 0 && (
            <div className="bg-card border border-dashed border-border p-12 text-center">
              <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Inga biljetttyper skapade än.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Använd formuläret till vänster för att skapa din första biljettyp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
