import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert, MessageSquareText } from 'lucide-react'

export const Route = createFileRoute('/en/rules')({
  component: RulesPage,
})

function RulesPage() {
  // Fallback content if database is empty
  const fallbackEventRules = [
    'No alcohol or drugs. It is not allowed to bring, use, or sell drugs or other intoxicating substances at the event.',
    'Zero tolerance for harassment. No hate, threats, discrimination, bullying, or sexual harassment. Respect everyone\'s boundaries.',
    'Be nice and considerate. Maintain a friendly tone, both at the venue and online (for example in Discord).',
    'Follow the organizers\' instructions. If an organizer tells you to do something, it applies immediately.',
    'Take care of the venue. No vandalism. Clean up after yourself and use trash bins.',
    'Respect others\' equipment. Don\'t touch other people\'s computers, screens, or cables without asking.',
    'Safety first. Keep hallways and emergency exits clear. Route cables so no one trips.',
    'Sound level. Use headphones when gaming. Speakers only if organizers approve.',
    'Photos and videos. Ask before taking photos or videos of someone. Respect if someone says no.',
    'Consequences. Breaking rules may result in a warning, being banned from the event, and in serious incidents police may be contacted.',
  ]

  const fallbackDiscordRules = [
    'Same rules as on-site. Zero tolerance for harassment, hate, threats, and discrimination.',
    'Stay in the right channel. Write in the right text channel and keep voice calls in the right voice channel.',
    'No spoilers or NSFW. No sexual content, gore, or other inappropriate material.',
    'No spam. No mass pings, floods, soundboards at max, or repeated memes that disturb.',
    'No advertising without permission. No advertising for servers, streams, or products without organizers\' approval.',
    'Respect privacy. Don\'t share personal information, IP addresses, doxxing, or private messages.',
    'Tickets/roles = no shortcuts. Don\'t try to bypass roles or access. Abuse can lead to banning.',
    'The mod team has the final word. Moderators can remove content, mute, or kick/ban as needed.',
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
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Guidelines</p>
          <h1 className="font-bold text-3xl md:text-5xl text-foreground mb-4">Rules</h1>
          <p className="text-lg text-muted-foreground">
            For everyone's wellbeing and safety at Lankoping.se
          </p>
        </div>

        {/* Event Rules Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground">Event Rules</h2>
          </div>
          
          <div className="space-y-4">
            {fallbackEventRules.map((rule, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discord Rules Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <MessageSquareText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground">Discord Rules</h2>
          </div>
          
          <div className="space-y-4">
            {fallbackDiscordRules.map((rule, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Lankoping.se — See you at the event!
          </p>
        </footer>
      </main>
    </div>
  )
}
