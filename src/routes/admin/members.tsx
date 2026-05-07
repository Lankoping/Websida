import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { UserRound, Search, Plus, Pencil, Trash2, Mail, Phone, MapPin, Ticket, Save, X } from 'lucide-react'
import { getSessionFn } from '../../server/functions/auth'
import {
  createBuyerProfileFn,
  deleteBuyerProfileFn,
  getMemberProfilesFn,
  updateBuyerProfileFn,
} from '../../server/functions/buyerProfiles'

export const Route = createFileRoute('/admin/members')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    if (!user || user.role !== 'organizer') {
      throw redirect({ to: '/admin' })
    }
  },
  loader: async () => {
    return await getMemberProfilesFn()
  },
  component: MembersPage,
})

function MembersPage() {
  const router = useRouter()
  const { profiles, totals } = Route.useLoaderData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(profiles[0]?.id ?? null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter((profile) => {
      return [profile.name, profile.email, profile.phone, profile.address, profile.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    })
  }, [profiles, searchQuery])

  const selectedProfile = filteredProfiles.find((profile) => profile.id === selectedProfileId) ?? filteredProfiles[0] ?? null

  const resetForm = () => {
    setFormMode('create')
    setEditId(null)
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setNotes('')
  }

  const startEdit = (profile: (typeof profiles)[number]) => {
    setFormMode('edit')
    setEditId(profile.id)
    setName(profile.name || '')
    setEmail(profile.email || '')
    setPhone(profile.phone || '')
    setAddress(profile.address || '')
    setNotes(profile.notes || '')
    setSelectedProfileId(profile.id)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      if (formMode === 'edit' && editId != null) {
        await updateBuyerProfileFn({
          data: {
            id: editId,
            name,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            externalId: undefined,
            notes: notes || undefined,
          },
        })
      } else {
        const created = await createBuyerProfileFn({
          data: {
            name,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            externalId: undefined,
            notes: notes || undefined,
          },
        })
        setSelectedProfileId(created.id)
      }
      await router.invalidate()
      resetForm()
    } catch (error: any) {
      alert(error?.message || 'Kunde inte spara profilen')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (profileId: number) => {
    if (!window.confirm('Är du säker på att du vill ta bort den här profilen?')) return
    setDeletingId(profileId)
    try {
      await deleteBuyerProfileFn({ data: profileId })
      if (selectedProfileId === profileId) setSelectedProfileId(null)
      await router.invalidate()
    } catch (error: any) {
      alert(error?.message || 'Kunde inte ta bort profilen')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyEmail = async (value: string) => {
    await navigator.clipboard.writeText(value)
    alert('E-post kopierad')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Medlemmar</p>
          <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
            <UserRound className="w-8 h-8 text-primary" />
            Medlemsprofiler
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Hantera kontaktprofiler, se kopplade biljetter och få en snabb bild av återkommande deltagare.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={resetForm}
            className="px-4 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-wider font-medium hover:text-foreground hover:border-primary/50 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny profil
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Profiler" value={totals.profiles} />
        <StatCard label="Aktiva medlemmar" value={profiles.filter((p) => p.membershipStatus === 'active').length} />
        <StatCard label="Kopplade profiler" value={totals.linkedProfiles} />
        <StatCard label="Kopplade biljetter" value={totals.linkedTickets} />
        <StatCard label="Biljett-omsättning" value={`${totals.totalSpent.toLocaleString('sv-SE')} SEK`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-2xl text-foreground">Skapa eller redigera profil</h2>
                <p className="text-sm text-muted-foreground">Profilerna matchas mot biljetter via e-postadress.</p>
              </div>
              {formMode === 'edit' && (
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Field label="Namn" value={name} onChange={setName} required placeholder="Namn på medlem" />
              <Field label="E-post" value={email} onChange={setEmail} placeholder="namn@exempel.se" type="email" icon={<Mail className="w-4 h-4" />} />
              <Field label="Telefon" value={phone} onChange={setPhone} placeholder="070-123 45 67" icon={<Phone className="w-4 h-4" />} />
              <Field label="Adress" value={address} onChange={setAddress} placeholder="Stad, gata eller förening" icon={<MapPin className="w-4 h-4" />} />
              <label className="md:col-span-2 space-y-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Anteckningar</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full min-h-28 p-3 bg-background border border-border outline-none focus:border-primary/50 transition-all text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="Internt stöd, allergier, frivilliginfo eller annan relevant notering"
                />
              </label>
              <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {formMode === 'edit' ? 'Du redigerar en befintlig profil.' : 'Skapa en ny profil i medlemsregistret.'}
                </p>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Sparar...' : formMode === 'edit' ? 'Uppdatera profil' : 'Skapa profil'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sök på namn, e-post, telefon, adress eller anteckning..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full p-3 pl-10 bg-background border border-border focus:border-primary/50 outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground"
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Profil</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Medlemskap</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Biljetter</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground text-right">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-sm text-muted-foreground">
                        Inga profiler matchade sökningen.
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <tr
                        key={profile.id}
                        className={`cursor-pointer transition-colors ${selectedProfileId === profile.id ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}
                        onClick={() => setSelectedProfileId(profile.id)}
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.email || 'Ingen e-post'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 border ${
                              profile.membershipStatus === 'active'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : profile.membershipStatus === 'expired'
                                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  : 'bg-muted/10 text-muted-foreground border-muted/20'
                            }`}
                          >
                            {profile.membershipStatus === 'active'
                              ? 'Aktiv'
                              : profile.membershipStatus === 'expired'
                                ? 'Utgått'
                                : 'Ingen'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-foreground">{profile.ticketCount}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                startEdit(profile)
                              }}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(profile.id)
                              }}
                              disabled={deletingId === profile.id}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 sticky top-4 h-fit space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-foreground">Profilvy</h2>
              <p className="text-sm text-muted-foreground">Detaljer och matchad biljettdata.</p>
            </div>
            <Ticket className="w-5 h-5 text-primary" />
          </div>

          {selectedProfile ? (
            <>
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-display text-foreground">{selectedProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email || 'Ingen e-post'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoChip
                    label="Status"
                    value={
                      <span
                        className={selectedProfile.membershipStatus === 'active' ? 'text-green-500' : 'text-muted-foreground'}
                      >
                        {selectedProfile.membershipStatus === 'active' ? 'Aktiv Medlem' : 'Ej Medlem'}
                      </span>
                    }
                  />
                  <InfoChip
                    label="Giltigt till"
                    value={
                      selectedProfile.membershipExpiresAt
                        ? new Date(selectedProfile.membershipExpiresAt).toLocaleDateString('sv-SE')
                        : 'N/A'
                    }
                  />
                  <InfoChip label="Biljetter" value={selectedProfile.ticketCount} />
                  <InfoChip label="Omsättning" value={`${selectedProfile.totalSpent.toLocaleString('sv-SE')} SEK`} />
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Kontakt</p>
                <DetailRow label="Telefon" value={selectedProfile.phone || 'Saknas'} />
                <DetailRow label="Adress" value={selectedProfile.address || 'Saknas'} />
                <DetailRow label="Senast aktivitet" value={selectedProfile.lastActivityAt ? new Date(selectedProfile.lastActivityAt).toLocaleDateString('sv-SE') : 'Saknas'} />
                <DetailRow label="Senaste event" value={selectedProfile.lastEventTitle || 'Saknas'} />
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Anteckningar</p>
                <p className="text-sm text-foreground whitespace-pre-line">{selectedProfile.notes || 'Inga anteckningar ännu.'}</p>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Kopplade biljetter</p>
                {selectedProfile.linkedTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga biljetter hittades för den här profilen.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {selectedProfile.linkedTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-border p-3 bg-background space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{ticket.eventTitle}</p>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{ticket.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ticket.ticketType} · {ticket.pricePaid} SEK · {ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString('sv-SE') : 'Okänt datum'}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">{ticket.ticketCode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProfile.email && (
                <button
                  type="button"
                  onClick={() => handleCopyEmail(selectedProfile.email!)}
                  className="w-full px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-all"
                >
                  Kopiera e-post
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Välj en profil i listan för att se detaljer.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card border border-border p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-display text-foreground">{value}</p>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', icon, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode; required?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 bg-background border border-border outline-none focus:border-primary/50 transition-all text-sm text-foreground placeholder:text-muted-foreground ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </label>
  )
}

function InfoChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  )
}