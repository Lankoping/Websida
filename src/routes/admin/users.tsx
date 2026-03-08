import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createUserFn, getUsersFn, changePasswordFn } from '../../server/functions/auth'

export const Route = createFileRoute('/admin/users')({
  loader: async () => {
    return { users: await getUsersFn() }
  },
  component: AdminUsers,
})

function AdminUsers() {
  const router = useRouter()
  const { users } = Route.useLoaderData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  
  const [changingPasswordId, setChangingPasswordId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChangePassword = async (userId: number, e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordError('')
    setIsChangingPassword(true)

    try {
      await changePasswordFn({
        data: {
          userId,
          newPassword,
        },
      })
      setChangingPasswordId(null)
      setNewPassword('')
      await router.invalidate()
    } catch (err: any) {
      setChangePasswordError(err?.message || 'Could not change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      await createUserFn({
        data: {
          email,
          password,
          name: name || undefined,
        },
      })

      setEmail('')
      setPassword('')
      setName('')
      await router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Could not create user')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
      
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Hantera</p>
        <h2 className="font-display text-3xl tracking-wide mb-2">Användare</h2>
        <p className="text-xs text-[#F0E8D8]/50">Nya användare tilldelas rollen <span className="text-[#C04A2A] uppercase tracking-wider text-[10px] ml-1">admin</span>.</p>
      </div>

      <form onSubmit={handleCreateUser} className="mb-12 grid gap-4 md:grid-cols-2 p-6 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm relative group">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C04A2A]/50 to-transparent" />
        
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namn@exempel.se"
            className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/20 transition-all font-mono"
            required
          />
        </div>
        
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Lösenord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/20 transition-all font-mono"
            required
          />
        </div>

        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Namn</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Visningsnamn (frivilligt)"
            className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm placeholder:text-[#F0E8D8]/20 transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Behörighet</label>
          <div className="w-full p-3 bg-[#100E0C]/50 border border-[#C04A2A]/10 rounded-sm text-[#C04A2A]/50 text-[11px] uppercase tracking-[0.2em] flex items-center">
            Admin
          </div>
        </div>
        
        <div className="md:col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-[#C04A2A]/10">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(192,74,42,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? 'Skapar...' : 'Skapa Användare'}
          </button>
          {error && <p className="text-red-400/80 text-[11px] tracking-wide uppercase font-medium">{error}</p>}
        </div>
      </form>

      <div className="mb-6 p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Sök på namn, e-post eller behörighet..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all placeholder:text-[#F0E8D8]/30"
          />
          <span className="absolute left-3 top-[10px] text-[#C04A2A]/50 text-lg">⌕</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="relative group p-6 bg-[#1A1816]/50 border border-[#C04A2A]/20 hover:border-[#C04A2A]/50 rounded-sm transition-all hover:bg-[#1C1A18]">
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#C04A2A] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-xl tracking-wide text-[#F0E8D8] mb-1">{user.name || 'Unnamed user'}</p>
                <p className="text-xs text-[#F0E8D8]/40 font-mono tracking-tight">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setChangingPasswordId(user.id)
                    setNewPassword('')
                    setChangePasswordError('')
                  }}
                  className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#F0E8D8]/20 text-[#F0E8D8]/60 hover:text-[#C04A2A] hover:border-[#C04A2A]/50 transition-colors"
                >
                  Byt lösenord
                </button>
                <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#C04A2A]/30 text-[#C04A2A] bg-[#C04A2A]/10">
                  {user.role}
                </span>
              </div>
            </div>
            
            {changingPasswordId === user.id && (
              <form onSubmit={(e) => handleChangePassword(user.id, e)} className="mt-4 pt-4 border-t border-[#C04A2A]/10">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Nytt lösenord</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nytt lösenord"
                      className="w-full p-2 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm transition-all font-mono"
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-[#C04A2A] text-white text-[10px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] transition-all disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Sparar...' : 'Spara'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangingPasswordId(null)}
                    className="px-4 py-2 bg-transparent text-[#F0E8D8]/60 text-[10px] uppercase tracking-[0.15em] font-medium rounded-sm border border-[#F0E8D8]/20 hover:text-[#F0E8D8] hover:border-[#F0E8D8]/40 transition-all"
                  >
                    Avbryt
                  </button>
                </div>
                {changePasswordError && <p className="text-red-400/80 text-[10px] tracking-wide uppercase font-medium mt-2">{changePasswordError}</p>}
              </form>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-[#F0E8D8]/50 bg-[#1A1816]/30 border border-dashed border-[#C04A2A]/30 rounded-sm">
            <p className="font-serif italic text-lg mb-4">
              {users.length === 0 ? "Inga användare hittades." : "Inga användare matchade din sökning."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
