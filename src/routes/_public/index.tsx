<<<<<<< Updated upstream
import { ComingSoon } from '@/components/coming-soon'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: Index,
})

function Index() {
  return (
    <>
      <ComingSoon />
    </>
=======
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-2xl p-8 text-center">
        <h1 className="font-display text-5xl mb-4">Lankoping.se</h1>
        <p className="text-lg mb-6">Vi är tillbaka snart. Tack för ditt tålamod.</p>
        <p className="text-sm text-muted-foreground">Inga administrativa funktioner krävs.</p>
      </div>
    </div>
>>>>>>> Stashed changes
  )
}
