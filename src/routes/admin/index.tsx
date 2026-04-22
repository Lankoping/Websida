import { createFileRoute } from '@tanstack/react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
})

function AdminOverview() {
  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">Välkommen</h1>
      </header>
      
      <div className="flex-1 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Översikt</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="mb-6 text-muted-foreground">Här kan du hantera innehåll, biljetter och se statistik för Lankoping.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Biljettförsäljning (senaste 30 dagarna)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">142 st</div>
                  <p className="text-sm text-emerald-600 font-medium mt-1">+12% från föregående period</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Aktiva besökare (just nu)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24 st</div>
                  <p className="text-sm text-muted-foreground mt-1">Baserat på realtidsdata</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Kommande event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3 st</div>
                  <p className="text-sm text-muted-foreground mt-1">Nästa event om 5 dagar</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
