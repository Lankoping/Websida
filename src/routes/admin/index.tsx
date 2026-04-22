import { createFileRoute } from '@tanstack/react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
})

function AdminOverview() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">Välkommen</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Översikt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Här kan du hantera innehåll, biljetter och se statistik för Lankoping.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Biljettförsäljning (senaste 30 dagarna)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142 st</div>
                <p className="text-xs text-muted-foreground">+12% från föregående period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktiva besökare (just nu)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24 st</div>
                <p className="text-xs text-muted-foreground">Baserat på realtidsdata</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
