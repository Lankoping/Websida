import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Clock } from 'lucide-react'

export const Route = createFileRoute('/blogs/')({
  component: BlogsIndex,
})

function BlogsIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
       {/* Header */}
       <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase italic">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase italic mb-6">
            <BookOpen size={14} />
            Nyheter & Uppdateringar
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Senaste Nytt</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Här hittar du nyheter om kommande event, uppdateringar från föreningen och annat spännande som händer i communityn.
          </p>
        </div>

        <div className="py-24 border-y border-border flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-secondary flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-black uppercase italic mb-2 text-foreground">Inga inlägg ännu</h2>
          <p className="text-muted-foreground max-w-sm">
            Vi förbereder för fullt inför nästa stora uppdatering. Håll utkik här snart!
          </p>
        </div>

        <div className="mt-16 text-center">
           <p className="text-sm text-muted-foreground mb-4 uppercase italic font-bold">Vill du veta mer direkt?</p>
           <a 
            href="https://discord.gg/h8wuaqyBwT" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity uppercase italic"
          >
            Gå med i vår Discord
          </a>
        </div>
      </main>

      <footer className="mt-24 border-t border-border py-12 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
           <span className="font-black tracking-tighter uppercase italic">Länköping<span className="text-primary">.se</span></span>
           <p className="text-xs text-muted-foreground">© 2026 Länköping.se</p>
        </div>
      </footer>
    </div>
  )
}
