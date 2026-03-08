import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '../server/functions/auth'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await loginFn({ data: { email, passwordHash: password } }) // Simplified hash
      if (res.success) {
        window.location.href = '/admin' // Force reload to pick up cookie
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Login failed')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#100E0C] text-[#F0E8D8] relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C04A2A11_1px,transparent_1px),linear-gradient(to_bottom,#C04A2A11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md p-10 bg-[#141210]/80 border border-[#C04A2A]/20 rounded-sm relative z-10 backdrop-blur-sm shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
        
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-3">System</p>
          <h1 className="font-display text-4xl tracking-wide text-[#F0E8D8]">Inloggning</h1>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 text-sm text-center font-mono">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2 pl-1">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all"
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2 pl-1">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-8 py-4 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(192,74,42,0.3)]"
          >
            Logga In
          </button>
        </form>
        
        <div className="mt-8 text-center">
           <a href="/" className="text-[10px] text-[#F0E8D8]/30 hover:text-[#C04A2A] transition-colors uppercase tracking-[0.1em]">← Tillbaka till start</a>
        </div>
      </div>
    </div>
  )
}
