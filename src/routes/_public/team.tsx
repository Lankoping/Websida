import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Users, Crown, Star } from 'lucide-react'
import * as Icons from 'lucide-react'

// Map icon names to lucide-react components
function getIconByName(iconName: string) {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Crown: Icons.Crown,
    Code: Icons.Code,
    Heart: Icons.Heart,
    Star: Icons.Star,
    Zap: Icons.Zap,
    Shield: Icons.Shield,
    Target: Icons.Target,
    Trophy: Icons.Trophy,
    Flame: Icons.Flame,
    Users: Icons.Users,
    Gamepad2: Icons.Gamepad2,
  }
  return iconMap[iconName] || Icons.User
}

export const Route = createFileRoute('/_public/team')({
  component: TeamPage,
})

function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Elias',
      role: 'Grundare & Ägare',
      description: 'Visionär och drivande kraft bakom Lankoping.se. Brinner för att skapa en trygg och rolig miljö för alla gamers.',
      icon: 'Crown'
    },
    {
      id: 2,
      name: 'Victor',
      role: 'Grundare & Ägare',
      description: 'Tekniskt ansvarig och strateg. Ser till att allt flyter på bakom kulisserna, från servrar till nätverk.',
      icon: 'Crown'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase italic">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Page Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase italic mb-6">
            <Users size={14} />
            Människorna bakom
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Teamet</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Lankoping.se drivs av ett dedikerat team som älskar gaming och community-bygge.
          </p>
        </div>

        {/* Intro Section */}
        <section className="mb-20 p-8 border-2 border-primary bg-primary/5 italic">
           <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">Två personers passion</h2>
           <p className="text-lg text-foreground/80 leading-relaxed">
             Vi startade detta som ett hobbyprojekt för att vi kände att det saknades en riktig community-driven mötesplats för gamers i Östergötland. Idag är vi en växande förening som välkomnar alla.
           </p>
        </section>

        {/* Team Members Grid */}
        <section className="mb-24">
          <div className="grid gap-8 md:grid-cols-2">
            {teamMembers.map((member) => {
              const IconComponent = getIconByName(member.icon)
              return (
                <div 
                  key={member.id}
                  className="group p-8 border border-border bg-card hover:border-primary/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star size={64} />
                  </div>
                  
                  <div className="w-14 h-14 flex items-center justify-center bg-secondary text-primary mb-8 group-hover:scale-110 transition-transform">
                    {IconComponent ? <IconComponent className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                  </div>
                  
                  <h3 className="text-2xl font-black text-foreground uppercase italic mb-1 tracking-tight">{member.name}</h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">{member.role}</p>
                  
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {member.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="font-black tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
             <p className="text-xs text-muted-foreground uppercase font-bold italic">
              Skapat med passion för gaming
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
