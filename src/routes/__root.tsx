import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { CookieConsent } from '@/components/cookie-consent'

interface MyRouterContext {
  queryClient: QueryClient
}

const scripts: React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>[] = []

if (import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC) {
  scripts.push({
    src: import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC,
    type: 'module',
  })
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => {
    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'Länköping.se – Gaming Community & LAN Events',
        },
        {
          name: 'description',
          content:
            'Länköping.se är en ideell förening som arrangerar LAN-event och skapar en community för gamers i Norrköping och Linköping.',
        },
        {
          property: 'og:title',
          content: 'Länköping.se – Gaming Community & LAN Events',
        },
        {
          property: 'og:description',
          content:
            'Häng med på nästa LAN, träffa nya kompisar och tävla i dina favoritspel med Länköping.se.',
        },
        {
          property: 'og:type',
          content: 'website',
        },
      ],
      links: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap',
        },
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
      scripts: [...scripts],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <CookieConsent />
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
