// Nitro plugin for server initialization
// This runs when the Nitro server starts

import { defineNitroPlugin } from 'nitropack/runtime'
import { initializeServer } from '../../src/server/init'

export default defineNitroPlugin(async () => {
  console.log('🔌 Nitro plugin: Initializing server...')
  await initializeServer()
})
