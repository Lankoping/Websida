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
          <p>Här kan du hantera innehåll, biljetter och se statistik för Lankoping.</p>
        </CardContent>
      </Card>
    </div>
  )
}
