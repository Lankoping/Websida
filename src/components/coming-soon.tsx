'use client'

import { Link } from '@tanstack/react-router'
import * as Icons from 'lucide-react'

const fallbackContent = {
  eyebrow: 'LAN-Event i Norrkoping',
  headline: 'Lankoping',
  tagline: 'Gaming Community',
  description: 'Vi bygger en gemenskap for gamers i Ostergotland. Snart oppnar vi dorrar till vart forsta event.',
  rulesLabel: 'Regler',
  teamLabel: 'Team',
  privacyLabel: 'Integritet',
  rights: 'Alla rättigheter förbehållna',
  primaryButtonText: 'Discord',
  primaryButtonLink: 'https://discord.gg/h8wuaqyBwT',
  secondaryButtonText: '',
  secondaryButtonLink: 'https://www.youtube.com/@LANKPNG',
}

export function ComingSoon() {
  const content = fallbackContent
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-bold text-xl tracking-tight text-foreground">Lankoping</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.rulesLabel}
            </Link>
            <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.teamLabel}
            </Link>
            <Link to="/datapolicy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.privacyLabel}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <a 
              href="https://discord.gg/h8wuaqyBwT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - grows to fill available space */}
      <main className="flex-1 pt-20">
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-6">
              {content.eyebrow}
            </p>
            
            {/* Main Headline */}
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight text-foreground mb-6">
              {content.headline}
            </h1>
            
            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {content.tagline}
            </p>

            {/* Divider */}
            <div className="w-12 h-1 bg-primary/20 mx-auto mb-10" />
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-12">
              {content.description}
            </p>

            {/* Primary Button */}
            <a 
              href={content.primaryButtonLink} 
              target={content.primaryButtonLink.startsWith('http') ? '_blank' : undefined}
              rel={content.primaryButtonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="px-8 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {content.primaryButtonText}
            </a>
            {/* Secondary Button */}
            {content.secondaryButtonText && (
              <a 
                href={content.secondaryButtonLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 border border-border text-foreground font-medium hover:bg-secondary transition-colors"
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </section>
      </main>

      {/* Footer - stays at bottom */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <span className="font-bold text-lg text-foreground">Lankoping</span>
              <span className="text-muted-foreground text-sm">.se</span>
            </div>
            <nav className="flex items-center gap-6 md:hidden">
              <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.rulesLabel}
              </Link>
              <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.teamLabel}
              </Link>
              <Link to="/datapolicy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.privacyLabel}
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2026 Lankoping.se — {content.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
