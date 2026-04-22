import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl tracking-tight text-foreground">Lankoping</Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Regler
            </Link>
            <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Team
            </Link>
            <Link to="/datapolicy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Datapolicy
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <a 
              href="https://discord.gg/h8wuaqyBwT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="font-bold text-lg text-foreground">Lankoping</span>
                <span className="text-muted-foreground text-sm">.se</span>
              </Link>
            </div>
            <nav className="flex items-center gap-6 md:hidden">
              <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Regler
              </Link>
              <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Team
              </Link>
              <Link to="/datapolicy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Datapolicy
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2026 Lankoping.se — Alla rättigheter förbehållna
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
