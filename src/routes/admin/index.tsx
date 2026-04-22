import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Adminpanel</p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground">Översikt</h1>
          <p className="text-muted-foreground mt-2">Välkommen tillbaka! Hantera ditt innehåll.</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-card border border-border">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-xs font-medium tracking-widest text-primary uppercase">Innehåll</span>
          </div>
          <h2 className="font-display text-2xl text-foreground">Välkommen till Adminpanelen</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center py-16">
            <h3 className="font-display text-2xl text-foreground mb-2">
              Allt ser bra ut!
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Använd menyn till vänster för att navigera och hantera systemet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
