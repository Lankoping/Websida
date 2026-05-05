import { createFileRoute } from '@tanstack/react-router'
import SponsorCalculator from '@/components/sponsor-calculator'

export const Route = createFileRoute('/sponsor')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-20">
        <section className="max-w-6xl mx-auto px-6 py-12">
          <SponsorCalculator />
        </section>
      </main>
    </div>
  )
}
