// Server initialization - runs when the server starts
import { ensureDemoTesterUser, DEMO_TESTER_EMAIL } from './lib/access'

let initialized = false

export async function initializeServer() {
  if (initialized) {
    console.log('⚠️  Server already initialized, skipping...')
    return
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║          🚀 Lanköping.se Server Starting...              ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  initialized = true

  try {
    await ensureDemoTesterUser()
    console.log(`✅ Demo user ensured: ${DEMO_TESTER_EMAIL}`)
  } catch (error) {
    console.error('⚠️  Could not ensure demo user', error)
  }

  console.log('✅ Server initialization complete\n')
}

// Auto-initialize on import in production
if (process.env.NODE_ENV === 'production' || process.env.AUTO_INIT === 'true') {
  void initializeServer()
}
