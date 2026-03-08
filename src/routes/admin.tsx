import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn, logoutFn } from '../server/functions/auth'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const user = await getSessionFn()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    if (user.role !== 'admin') {
      throw redirect({ to: '/' })
    }

    return { user }
  },
  loader: async ({ context: { user } }) => {
    return { user }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useLoaderData()

  const handleLogout = async () => {
    await logoutFn()
    window.location.href = '/'
  }

  return (
    <div className="flex h-screen bg-[#100E0C] text-[#F0E8D8] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#141210] p-6 border-r border-[#C04A2A]/20 flex flex-col">
        <h2 className="font-display tracking-widest text-3xl text-[#C04A2A] mb-12">Admin Panel</h2>
        <nav className="space-y-6 flex-1">
          <a href="/admin/posts" className="block text-[11px] uppercase tracking-[0.1em] text-[#F0E8D8]/70 hover:text-[#C04A2A] transition-colors">Posts</a>
          <a href="/admin/users" className="block text-[11px] uppercase tracking-[0.1em] text-[#F0E8D8]/70 hover:text-[#C04A2A] transition-colors">Users</a>
        </nav>
        <button onClick={handleLogout} className="text-[11px] uppercase tracking-[0.1em] text-red-500/70 hover:text-red-400 block w-full text-left transition-colors">Logout</button>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-[#100E0C] relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#C04A2A11_1px,transparent_1px),linear-gradient(to_bottom,#C04A2A11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <header className="relative flex justify-between items-end mb-12 pb-4 border-b border-[#C04A2A]/20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Inloggad som</p>
            <h1 className="font-display text-4xl tracking-wide text-[#F0E8D8]">{user.name}</h1>
          </div>
        </header>
        <div className="relative">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
