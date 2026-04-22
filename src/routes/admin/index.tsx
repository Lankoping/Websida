import { createFileRoute } from '@tanstack/react-router'
import { getDbStatsFn } from '../../server/functions/stats'
import { Database, AlertTriangle, CheckCircle, Server } from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    return await getDbStatsFn()
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const dbStats = Route.useLoaderData()

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* System Status Card */}
        <div className="bg-card border border-border">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-foreground">Systemstatus</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Databasrader (Totalt)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono text-foreground">{dbStats.totalRows.toLocaleString('sv-SE')}</span>
                  <span className="text-sm text-muted-foreground">rader</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Synkroniseringsstatus</p>
                {dbStats.outOfSync ? (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 border border-orange-200 p-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">Varning: Databasen kan vara ur synk med schemat</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 p-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Databasen är synkroniserad ({dbStats.migrationsCount} migreringar)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-foreground">Databasdetaljer</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(dbStats.tableStats || {}).map(([table, count]) => (
                <div key={table} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-mono text-muted-foreground">{table}</span>
                  <span className="text-sm font-medium text-foreground">{count.toLocaleString('sv-SE')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
