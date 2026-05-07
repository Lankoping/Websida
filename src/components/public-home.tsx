'use client'

import { Link } from '@tanstack/react-router'
import { ShieldAlert, Users, MessageSquare, ArrowRight, Gamepad2, Info, Heart, Star, ShieldCheck } from 'lucide-react'

const swedishContent = {
  hero: {
    eyebrow: 'LAN-Event & Community',
    headline: 'Lankoping.se',
    tagline: 'Gaming för alla i Östergötland',
    description: 'Lankoping är en ideell förening som skapar mötesplatser för gamers. Vi arrangerar LAN-event där du kan spela, tävla och träffa nya vänner i en trygg miljö.',
    primaryButton: 'Gå med i Discord',
    secondaryButton: 'Våra Regler',
  },
  about: {
    title: 'Vilka är vi?',
    description: 'Vi är en grupp passionerade gamers som vill främja gamingkulturen. Genom våra event skapar vi en plattform för ungdomar att nätverka och ha roligt tillsammans.',
    points: [
      {
        icon: Users,
        title: 'Community',
        text: 'En välkomnande gemenskap för alla oavsett spelnivå.'
      },
      {
        icon: Star,
        title: 'Medlemskap',
        text: 'För 85 kr/mån får du 25% rabatt på biljetter och förtur vid släpp.'
      },
      {
        icon: ShieldCheck,
        title: 'Fiscal Hosted',
        text: 'Vi förvaltas av Hack Foundation (HCB), vilket garanterar transparens.'
      }
    ]
  },
  rules: {
    title: 'Trivsel & Regler',
    description: 'För att alla ska ha roligt har vi några enkla regler vi följer.',
    link: 'Läs alla regler',
  },
  team: {
    title: 'Möt Teamet',
    description: 'Människorna bakom Lankoping.se som gör allt möjligt.',
    link: 'Se hela teamet',
  },
  footer: {
    rights: 'Alla rättigheter förbehållna',
  }
}

const englishContent = {
  hero: {
    eyebrow: 'LAN-Events & Community',
    headline: 'Lankoping.se',
    tagline: 'Gaming for everyone in Östergötland',
    description: 'Lankoping is a non-profit organization creating meeting places for gamers. We host LAN events where you can play, compete, and meet new friends in a safe environment.',
    primaryButton: 'Join Discord',
    secondaryButton: 'Our Rules',
  },
  about: {
    title: 'Who are we?',
    description: 'We are a group of passionate gamers promoting gaming culture. Through our events, we create a platform for youth to network and have fun together.',
    points: [
      {
        icon: Users,
        title: 'Community',
        text: 'A welcoming community for everyone, regardless of skill level.'
      },
      {
        icon: Heart,
        title: 'Non-profit',
        text: 'Driven by passion, not profit. Everything goes back to the community.'
      },
      {
        icon: ShieldAlert,
        title: 'Safety',
        text: 'Clear rules and present organizers/adults.'
      }
    ]
  },
  rules: {
    title: 'Well-being & Rules',
    description: 'To ensure everyone has fun, we have some simple rules we follow.',
    link: 'Read all rules',
  },
  team: {
    title: 'Meet the Team',
    description: 'The people behind Lankoping.se making it all possible.',
    link: 'See the whole team',
  },
  footer: {
    rights: 'All rights reserved',
  }
}

interface PublicHomeProps {
  language?: 'sv' | 'en'
}

export function PublicHome({ language = 'sv' }: PublicHomeProps) {
  const content = language === 'en' ? englishContent : swedishContent
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={language === 'en' ? '/en' : '/'} className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tighter text-foreground uppercase italic">Lankoping<span className="text-primary">.se</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to={language === 'en' ? '/en/rules' : '/rules'} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {language === 'en' ? 'Rules' : 'Regler'}
            </Link>
            <Link to={language === 'en' ? '/en/team' : '/team'} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {language === 'en' ? 'Team' : 'Teamet'}
            </Link>
            <Link to="/blogs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {language === 'en' ? 'News' : 'Nyheter'}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
             <Link 
              to={language === 'en' ? '/' : '/en'} 
              className="text-xs font-bold px-2 py-1 border border-border hover:bg-secondary transition-colors uppercase"
            >
              {language === 'en' ? 'SV' : 'EN'}
            </Link>
            <a 
              href="https://discord.gg/h8wuaqyBwT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-bold px-5 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity uppercase italic"
            >
              Discord
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
              <Gamepad2 size={14} />
              {content.hero.eyebrow}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-6 uppercase italic">
              {content.hero.headline}
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto leading-tight">
              {content.hero.tagline}
            </p>
            
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-12">
              {content.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://discord.gg/h8wuaqyBwT" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity uppercase italic text-lg"
              >
                {content.hero.primaryButton}
              </a>
              <Link 
                to={language === 'en' ? '/en/rules' : '/rules'}
                className="w-full sm:w-auto px-10 py-4 border-2 border-border text-foreground font-black hover:bg-secondary transition-colors uppercase italic text-lg"
              >
                {content.hero.secondaryButton}
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 bg-secondary/30 border-y border-border px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6 uppercase italic">
                  {content.about.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {content.about.description}
                </p>
                <div className="space-y-6">
                  {content.about.points.map((point, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                        <point.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground uppercase italic">{point.title}</h3>
                        <p className="text-muted-foreground text-sm">{point.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video bg-card border border-border overflow-hidden relative group">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad2 className="w-24 h-24 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-primary/20 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-primary/20 -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Informative Sections */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Rules Block */}
            <div className="p-8 md:p-12 border border-border bg-card hover:border-primary/30 transition-colors group">
              <ShieldAlert className="w-12 h-12 text-primary mb-8 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-black mb-4 uppercase italic">{content.rules.title}</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {content.rules.description}
              </p>
              <Link 
                to={language === 'en' ? '/en/rules' : '/rules'}
                className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all uppercase italic"
              >
                {content.rules.link} <ArrowRight size={18} />
              </Link>
            </div>

            {/* Team Block */}
            <div className="p-8 md:p-12 border border-border bg-card hover:border-primary/30 transition-colors group">
              <Users className="w-12 h-12 text-primary mb-8 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-black mb-4 uppercase italic">{content.team.title}</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {content.team.description}
              </p>
              <Link 
                to={language === 'en' ? '/en/team' : '/team'}
                className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all uppercase italic"
              >
                {content.team.link} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* News CTA */}
        <section className="py-24 bg-primary text-primary-foreground px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Info className="w-12 h-12 mx-auto mb-8 opacity-50" />
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter">
              {language === 'en' ? 'Stay Updated' : 'Håll dig uppdaterad'}
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed">
              {language === 'en' 
                ? 'We are constantly working on new events and improvements. Follow our blog for the latest news.'
                : 'Vi jobbar ständigt på nya event och förbättringar. Följ vår blogg för de senaste nyheterna.'}
            </p>
            <Link 
              to="/blogs"
              className="inline-block px-10 py-4 bg-background text-foreground font-black hover:bg-secondary transition-colors uppercase italic text-lg"
            >
              {language === 'en' ? 'Go to News' : 'Till Nyheterna'}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="font-black text-2xl tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
              <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                En ideell förening för gamers i Östergötland. Grundad med passion för gemenskap.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-xs uppercase tracking-widest text-primary">Sidor</span>
                <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground">Regler</Link>
                <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground">Teamet</Link>
                <Link to="/blogs" className="text-sm text-muted-foreground hover:text-foreground">Nyheter</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-xs uppercase tracking-widest text-primary">Juridiskt</span>
                <Link to="/datapolicy/se" className="text-sm text-muted-foreground hover:text-foreground">Integritet</Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Villkor</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-xs uppercase tracking-widest text-primary">Socialt</span>
                <a href="https://discord.gg/h8wuaqyBwT" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Discord</a>
                <a href="https://www.youtube.com/@LANKPNG" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">YouTube</a>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Lankoping.se — {content.footer.rights}
            </p>
            <p className="text-xs text-muted-foreground">
              Skapad med ❤️ av el4s & nauticalis
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
