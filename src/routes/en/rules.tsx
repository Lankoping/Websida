import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert, MessageSquareText, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/en" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase italic">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Page Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase italic mb-6">
            <ShieldCheck size={14} />
            Safety & Community
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Rules</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            For everyone's wellbeing and safety at Lankoping.se events and in our digital channels.
          </p>
        </div>

        {/* Event Rules Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-12 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Event Rules</h2>
          </div>
          
          <div className="grid gap-4">
            {fallbackEventRules.map((rule, i) => (
              <div 
                key={i} 
                className="group flex gap-6 p-6 border border-border bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-secondary text-primary font-black italic text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1.5 font-medium">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discord Rules Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-12 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Discord Rules</h2>
          </div>
          
          <div className="grid gap-4">
            {fallbackDiscordRules.map((rule, i) => (
              <div 
                key={i} 
                className="group flex gap-6 p-6 border border-border bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-secondary text-primary font-black italic text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1.5 font-medium">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="font-black tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
             <p className="text-sm text-muted-foreground font-bold uppercase italic">
              See you at the event!
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
