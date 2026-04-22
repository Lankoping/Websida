import { getDb } from '../src/server/db/runtime'
import { users } from '../src/server/db/schema'
import { hashPassword } from '../src/server/lib/password'
import { eq } from 'drizzle-orm'
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
  console.log('--- Set User Password ---')
  
  const email = await question('User Email: ')
  if (!email) {
    console.error('Email is required')
    process.exit(1)
  }

  const password = await question('New Password: ')
  if (!password) {
    console.error('Password is required')
    process.exit(1)
  }

  console.log('Updating password...')

  try {
    const db = await getDb()
    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length === 0) {
      console.error(`❌ User with email ${email} not found.`)
      process.exit(1)
    }

    await db.update(users)
      .set({ passwordHash: hashPassword(password) })
      .where(eq(users.email, email))

    console.log(`✅ Successfully updated password for user: ${email}`)
  } catch (error) {
    console.error('❌ Failed to update password:', error)
  } finally {
    rl.close()
    process.exit(0)
  }
}

main()
