import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  createUserFn,
  getUsersFn,
  changePasswordFn,
  deleteUserFn,
  getSessionFn,
  updateUserFn,
} from '../../server/functions/auth'
import { Copy, Mail } from 'lucide-react'

export const Route = createFileRoute('/admin/users')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    if (!user || user.role !== 'organizer') {
      throw redirect({ to: '/admin' })
    }
  },
  loader: async () => {
    return {
      users: await getUsersFn(),
      currentUser: await getSessionFn(),
    }
  },
  component: AdminUsers,
})

function AdminUsers() {
  const router = useRouter()
  const { users, currentUser } = Route.useLoaderData()
  
  // Create user state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'organizer' | 'volunteer'>('volunteer')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [createdUserLink, setCreatedUserLink] = useState<{name: string, email: string, link: string} | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Change password state
  const [changingPasswordId, setChangingPasswordId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Edit user state
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingRole, setEditingRole] = useState<'organizer' | 'volunteer'>('volunteer')
  const [editingActive, setEditingActive] = useState(true)
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null)
  
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleChangePassword = async (userId: number, e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordError('')
    setIsChangingPassword(true)
    try {
      await changePasswordFn({ data: { userId, newPassword } })
      setChangingPasswordId(null)
      setNewPassword('')
      await router.invalidate()
    } catch (err: any) {
      setChangePasswordError(err?.message || 'Kunde inte byta lösenord')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Är du säker på att du vill ta bort den här användaren?')) return
    setIsDeletingId(userId)
    try {
      await deleteUserFn({ data: { userId } })
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Kunde inte ta bort användaren')
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)
    setCreatedUserLink(null)
    try {
      const result = await createUserFn({ data: { email, password: password || undefined, name: name || undefined, role } })
      
      if (result.resetToken) {
        // Generate the reset link
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const resetLink = `${baseUrl}/login?userid=${result.user.id}&token=${result.resetToken}&makepassword=true`
        
        setCreatedUserLink({
          name: result.user.name || 'Användare',
          email: result.user.email,
          link: resetLink
        })
      }

      setEmail('')
      setPassword('')
      setName('')
      setRole('volunteer')
      await router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Kunde inte skapa användaren')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyId = async (userId: number) => {
    await navigator.clipboard.writeText(String(userId))
    setCopiedId(userId)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link)
    alert('Länk kopierad till urklipp!')
  }

  const handleStartEdit = (user: (typeof users)[number]) => {
    setEditingUserId(user.id)
    setEditingName(user.name || '')
    setEditingRole(user.role as 'organizer' | 'volunteer')
    setEditingActive(user.active !== false)
  }

  const handleUpdateUser = async (userId: number) => {
    setIsUpdatingId(userId)
    try {
      await updateUserFn({
        data: { userId, name: editingName || 'Namnlös användare', role: editingRole, active: editingActive },
      })
      setEditingUserId(null)
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Kunde inte uppdatera användaren')
    } finally {
      setIsUpdatingId(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">Användare</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Skapa organisatörer och volontärer, byt namn och kopiera ID för digital signering.
        </p>
      </div>

      {/* Create user */}
      <div className="bg-card border border-border p-5 rounded">
        <form onSubmit={handleCreateUser}>
          <h3 className="font-medium text-foreground mb-4">Skapa ny användare</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@exempel.se"
                className="w-full p-2.5 bg-background border border-border rounded text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Lösenord (Frivilligt)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Lämna tomt för att generera en länk"
                className="w-full p-2.5 bg-background border border-border rounded text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Visningsnamn (frivilligt)"
                className="w-full p-2.5 bg-background border border-border rounded text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Behörighet</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'organizer' | 'volunteer')}
                className="w-full p-2.5 bg-background border border-border rounded text-foreground text-sm outline-none focus:border-primary/60 transition-colors"
              >
                <option value="volunteer">Volontär</option>
                <option value="organizer">Organisatör</option>
              </select>
            </div>
            <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isSaving ? 'Skapar...' : 'Skapa användare'}
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </form>

        {/* Success message with reset link */}
        {createdUserLink && (
          <div className="mt-6 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-md">
            <h4 className="flex items-center gap-2 font-medium text-emerald-600 mb-2">
              <Mail className="w-4 h-4" />
              Användare skapad utan lösenord
            </h4>
            <p className="text-sm text-foreground/80 mb-4">
              Skicka följande meddelande till användaren så att de kan sätta sitt lösenord:
            </p>
            <div className="p-3 bg-background border border-border rounded text-sm font-mono text-muted-foreground whitespace-pre-wrap">
              Hej {createdUserLink.name}!{'\n\n'}
              {currentUser?.name || 'En administratör'} har begärt att du skapar ett Länköping-konto.{'\n\n'}
              Gå till följande länk för att skapa ditt lösenord:{'\n'}
              {createdUserLink.link}
            </div>
            <div className="mt-3 flex gap-3">
              <button 
                onClick={() => handleCopyLink(createdUserLink.link)}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground text-xs font-medium rounded hover:bg-secondary/80 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Kopiera länk
              </button>
              <a 
                href={`mailto:${createdUserLink.email}?subject=Ditt Länköping-konto&body=Hej ${createdUserLink.name}!%0D%0A%0D%0A${currentUser?.name || 'En administratör'} har begärt att du skapar ett Länköping-konto.%0D%0A%0D%0AGå till följande länk för att skapa ditt lösenord:%0D%0A${encodeURIComponent(createdUserLink.link)}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-3 h-3" />
                Skicka e-post
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Sök på namn, e-post eller roll..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2.5 pl-9 bg-background border border-border rounded text-foreground text-sm transition-colors placeholder:text-muted-foreground outline-none focus:border-primary/60"
        />
        <span className="absolute left-3 top-2.5 text-muted-foreground text-base">⌕</span>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border hover:border-primary/30 rounded transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-foreground">{user.name || 'Namnlös användare'}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>ID {user.id}</span>
                  <span>·</span>
                  <button type="button" onClick={() => handleCopyId(user.id)} className="text-primary hover:underline transition-colors">
                    {copiedId === user.id ? 'Kopierat!' : 'Kopiera ID'}
                  </button>
                  {user.active === false && <span className="text-red-500 font-medium">· Låst</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-medium border border-primary/30 text-primary bg-primary/5 rounded">
                  {user.role === 'organizer' ? 'Organisatör' : 'Volontär'}
                </span>
                <button
                  type="button"
                  onClick={() => handleStartEdit(user)}
                  className="px-3 py-1.5 text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 rounded transition-colors"
                >
                  Redigera
                </button>
                {(user.role !== 'organizer' || user.id === currentUser?.id) && (
                  <button
                    type="button"
                    onClick={() => { setChangingPasswordId(user.id); setNewPassword(''); setChangePasswordError('') }}
                    className="px-3 py-1.5 text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 rounded transition-colors"
                  >
                    Byt lösenord
                  </button>
                )}
                {user.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isDeletingId === user.id}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    {isDeletingId === user.id ? 'Tar bort...' : 'Ta bort'}
                  </button>
                )}
              </div>
            </div>

            {editingUserId === user.id && (
              <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Namn</label>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full p-2.5 bg-background border border-border rounded text-sm text-foreground outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Roll</label>
                    <select
                      value={editingRole}
                      onChange={(e) => setEditingRole(e.target.value as 'organizer' | 'volunteer')}
                      disabled={user.id === currentUser?.id}
                      className="w-full p-2.5 bg-background border border-border rounded text-sm text-foreground outline-none focus:border-primary/60 disabled:opacity-50"
                    >
                      <option value="volunteer">Volontär</option>
                      <option value="organizer">Organisatör</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Konto</label>
                    <label className="flex items-center gap-2 p-2.5 border border-border rounded text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingActive}
                        onChange={(e) => setEditingActive(e.target.checked)}
                        disabled={user.id === currentUser?.id}
                        className="accent-primary"
                      />
                      Aktivt konto
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateUser(user.id)}
                    disabled={isUpdatingId === user.id}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingId === user.id ? 'Sparar...' : 'Spara användare'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="px-4 py-2 border border-border text-muted-foreground text-sm rounded hover:text-foreground transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {changingPasswordId === user.id && (
              <form onSubmit={(e) => handleChangePassword(user.id, e)} className="px-4 pb-4 border-t border-border pt-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1.5">Nytt lösenord</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nytt lösenord"
                      className="w-full p-2.5 bg-background border border-border rounded text-foreground text-sm outline-none focus:border-primary/60 transition-colors font-mono"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isChangingPassword ? 'Sparar...' : 'Spara'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangingPasswordId(null)}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-border text-muted-foreground text-sm rounded hover:text-foreground transition-colors"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
                {changePasswordError && <p className="text-red-500 text-sm mt-2">{changePasswordError}</p>}
              </form>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded">
            <p>{users.length === 0 ? 'Inga användare hittades.' : 'Inga användare matchade din sökning.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
