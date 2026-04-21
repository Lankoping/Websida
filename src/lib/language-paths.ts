const swedishStaticPaths = new Set(['/', '/rules', '/team', '/privacy', '/blogs', '/nyheter', '/datapolicy/se'])

function isSwedishContentPath(pathname: string): boolean {
  if (swedishStaticPaths.has(pathname)) return true
  if (pathname.startsWith('/blogs/')) return true
  if (pathname.startsWith('/nyheter/')) return true
  return false
}

export function getLanguageToggle(pathname: string): { targetPath?: string; label?: 'EN' | 'SV' } {
  // Language switching is disabled as we are focusing on a Swedish audience only.
  return {}
}
