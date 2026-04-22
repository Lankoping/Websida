import { getDb } from '../src/server/db/runtime'
import { users } from '../src/server/db/schema'
import { hashPassword } from '../src/server/lib/password'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('--- Create Admin User ---')
  
  const email = await question('Email: ')
  if (!email) {
    console.error('Email is required')
    process.exit(1)
  }

  const name = await question('Name: ')
  
  const password = await question('Password: ')
  if (!password) {
    console.error('Password is required')
    process.exit(1)
  }

  console.log('Creating user...')

  try {
    const db = await getDb()
    
    await db.insert(users).values({
      email,
      name: name || null,
      passwordHash: hashPassword(password),
      role: 'organizer',
      active: true,
    })

    console.log(`✅ Successfully created organizer user: ${email}`)
  } catch (error) {
    console.error('❌ Failed to create user:', error)
  } finally {
    rl.close()
    process.exit(0)
  }
}

main()
