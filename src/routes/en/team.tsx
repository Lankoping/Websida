import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
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

export const Route = createFileRoute('/en/team')({
  component: TeamPage,
})

function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Elias',
      role: 'Owner',
      description: 'blah blah blah',
      icon: 'Crown'
    },
    {
      id: 2,
      name: 'Victor',
      role: 'Owner',
      description: 'blah blah blah',
      icon: 'Crown'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/en" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-16">
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Who Are We</p>
          <h1 className="font-bold text-3xl md:text-5xl text-foreground mb-4">The Team</h1>
          <p className="text-lg text-muted-foreground">
            Who are we that build Länköping?
          </p>
        </div>

        {/* Intro */}
        <section className="mb-16">
          <div className="max-w-2xl">
            <h2 className="font-bold text-xl text-foreground mb-4">Two People's Passion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Länköping is run by a small but dedicated team that loves creating digital experiences and building community for gamers in Östergötland.
            </p>
          </div>
        </section>

        {/* Team Members */}
        <section className="mb-16">
          {teamMembers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {teamMembers.map((member) => {
                const IconComponent = getIconByName(member.icon)
                return (
                  <div 
                    key={member.id}
                    className="p-8 border border-border bg-card hover:border-primary/20 transition-colors"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-secondary mb-6">
                      {IconComponent ? <IconComponent className="w-6 h-6 text-primary" /> : null}
                    </div>
                    <h3 className="font-bold text-xl text-primary mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">{member.role}</p>
                    <p className="text-foreground/80 leading-relaxed">{member.description}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 border border-border bg-card text-center text-muted-foreground">
              No team members available at the moment.
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Länköping.se — Created by el4s & nauticalis.
          </p>
        </footer>
      </main>
    </div>
  )
}
