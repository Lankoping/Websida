import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { BarChart3, CalendarDays, DollarSign, Ticket, Users2, TrendingUp, ShieldAlert } from 'lucide-react'
import { getSessionFn } from '../../server/functions/auth'
import { getAnalyticsDashboardFn } from '../../server/functions/insights'

export const Route = createFileRoute('/admin/analytics')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    if (!user || user.role !== 'organizer') {
      throw redirect({ to: '/admin' })
    }
  },
  loader: async () => {
    return await getAnalyticsDashboardFn()
  },
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { summary, dailySales, topEvents, topMembers } = Route.useLoaderData()
  const maxTickets = Math.max(1, ...dailySales.map((day) => day.tickets))
  const maxRevenue = Math.max(1, ...dailySales.map((day) => day.revenue))

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Analys</p>
          <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Insikter och statistik
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Följ biljettförsäljning, incheckningar och medlemsaktivitet utan att lämna adminpanelen.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link className="px-4 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-wider font-medium hover:text-foreground hover:border-primary/50 transition-all" to="/admin/members">
            Medlemsprofiler
          </Link>
          <Link className="px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-medium hover:bg-primary/90 transition-all" to="/admin/tickets">
            Biljetter
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Ticket className="w-4 h-4" />} label="Biljetter" value={summary.totalTickets} detail={`${summary.usedTickets} använda · ${summary.validTickets} aktiva`} />
        <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Omsättning" value={`${summary.totalRevenue.toLocaleString('sv-SE')} SEK`} detail={`Snitt ${summary.averageTicketValue.toLocaleString('sv-SE')} SEK/biljett`} />
        <MetricCard icon={<CalendarDays className="w-4 h-4" />} label="Event" value={summary.totalEvents} detail={`${summary.publishedEvents} publicerade`} />
        <MetricCard icon={<Users2 className="w-4 h-4" />} label="Medlemsprofiler" value={summary.memberProfiles} detail={`${summary.linkedMemberProfiles} med matchad biljettdata`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-2xl text-foreground">Säljtrend senaste 14 dagar</h2>
              <p className="text-sm text-muted-foreground">Biljetter och intäkter per dag.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>

          <div className="grid gap-3 sm:grid-cols-7">
            {dailySales.map((day) => (
              <div key={day.day} className="flex flex-col items-stretch gap-2">
                <div className="flex h-48 items-end gap-1 rounded-md border border-border bg-background p-2">
                  <div className="flex-1 flex flex-col justify-end items-center gap-1">
                    <div className="w-full rounded-sm bg-primary/20 border border-primary/30" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }} title={`Omsättning ${day.revenue} SEK`} />
                    <div className="w-full rounded-sm bg-primary" style={{ height: `${(day.tickets / maxTickets) * 100}%` }} title={`${day.tickets} biljetter`} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-foreground">{new Date(day.day).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{day.tickets} biljetter</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-display text-2xl text-foreground">Statusöversikt</h2>
              <p className="text-sm text-muted-foreground">Snabb kontroll av biljettstatus.</p>
            </div>
          </div>

          <StatusRow label="Använda biljetter" value={summary.usedTickets} />
          <StatusRow label="Aktiva biljetter" value={summary.validTickets} />
          <StatusRow label="Makulerade biljetter" value={summary.cancelledTickets} />

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Topplista medlemsprofiler</h3>
            <div className="space-y-3">
              {topMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Inga profiler med matchad biljettdata ännu.</p>
              ) : (
                topMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{index + 1}. {member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email || 'Ingen e-post'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{member.ticketCount} biljetter</p>
                      <p className="text-xs text-muted-foreground">{member.revenue.toLocaleString('sv-SE')} SEK</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-card border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-display text-2xl text-foreground">Toppevent</h2>
            <p className="text-sm text-muted-foreground">Sorterad efter antal sålda biljetter.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Event</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Sålda</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Incheckade</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Omsättning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('sv-SE')}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{event.sold}</td>
                    <td className="p-4 text-sm text-foreground">{event.used} ({event.checkedInRate}%)</td>
                    <td className="p-4 text-sm text-foreground">{event.revenue.toLocaleString('sv-SE')} SEK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-display text-2xl text-foreground">Medlemsaktivitet</h2>
            <p className="text-sm text-muted-foreground">Topp 8 profiler baserat på biljettdata.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Profil</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Biljetter</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Omsättning</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Senast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topMembers.length === 0 ? (
                  <tr>
                    <td className="p-4 text-sm text-muted-foreground" colSpan={4}>
                      Inga matchade profiler ännu.
                    </td>
                  </tr>
                ) : (
                  topMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email || 'Ingen e-post'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">{member.ticketCount}</td>
                      <td className="p-4 text-sm text-foreground">{member.revenue.toLocaleString('sv-SE')} SEK</td>
                      <td className="p-4 text-sm text-foreground">{member.lastPurchaseAt ? new Date(member.lastPurchaseAt).toLocaleDateString('sv-SE') : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: string }) {
  return (
    <div className="bg-card border border-border p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="text-3xl font-display text-foreground">{value}</div>
      <p className="text-sm text-muted-foreground mt-2">{detail}</p>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-medium text-foreground">{value}</span>
    </div>
  )
}