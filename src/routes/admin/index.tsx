import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getDbStatsFn, runDeepScanFn } from '../../server/functions/stats'
import { Database, AlertTriangle, CheckCircle, Server, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    return await getDbStatsFn()
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const initialStats = Route.useLoaderData()
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ isOutOfSync: boolean, message: string } | null>(null)

  const handleDeepScan = async () => {
    setIsScanning(true)
    setScanResult(null)
    try {
      const result = await runDeepScanFn()
      setScanResult(result)
      await router.invalidate()
    } catch (error) {
      alert('Ett fel uppstod vid skanningen.')
    } finally {
      setIsScanning(false)
    }
  }

  // Determine if out of sync based on initial load or recent scan
  const isOutOfSync = scanResult ? scanResult.isOutOfSync : initialStats.outOfSync

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Adminpanel</p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground">Översikt</h1>
          <p className="text-muted-foreground mt-2">Välkommen tillbaka! Hantera ditt innehåll.</p>
        </div>
        <button 
          onClick={handleDeepScan}
          disabled={isScanning}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Skanna DB
        </button>
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
                  <span className="text-4xl font-mono text-foreground">{initialStats.totalRows.toLocaleString('sv-SE')}</span>
                  <span className="text-sm text-muted-foreground">rader</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Synkroniseringsstatus</p>
                {isOutOfSync ? (
                  <div className="flex flex-col gap-2 text-orange-600 bg-orange-50 border border-orange-200 p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm font-medium">Varning: Databasen är ur synk med schemat</span>
                    </div>
                    {scanResult && <p className="text-xs ml-7">{scanResult.message}</p>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 text-green-600 bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Databasen är synkroniserad ({initialStats.migrationsCount} migreringar)</span>
                    </div>
                    {scanResult && <p className="text-xs ml-7">{scanResult.message}</p>}
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
              {(Object.entries(initialStats.tableStats || {}) as Array<[string, number]>).map(([table, count]) => (
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
