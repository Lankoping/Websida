import { db } from '../src/server/db/index'
import { users } from '../src/server/db/schema'
import { eq } from 'drizzle-orm'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('👑 Admin Account Setup Script')
  console.log('----------------------------')

  try {
    const email = await question('Enter admin email: ')
    if (!email) {
      console.error('❌ Email is required!')
      process.exit(1)
    }

    const name = await question('Enter display name (optional): ') || 'Admin'

    const password = await question('Enter password: ')
    if (!password) {
      console.error('❌ Password is required!')
      process.exit(1)
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existing.length > 0) {
      console.log(`\nUser with email '${email}' already exists.`)
      const confirm = await question('Do you want to update this user to be an Admin with the new password? (y/n): ')
      
      if (confirm.toLowerCase() === 'y') {
        await db.update(users).set({
          passwordHash: password, // In production, hash this!
          name: name,
          role: 'admin',
          active: true
        }).where(eq(users.email, email))
        console.log(`\n✅ Success: User '${email}' updated to Admin role with new password.`)
      } else {
        console.log('\nOperation cancelled.')
      }
    } else {
      await db.insert(users).values({
        email,
        passwordHash: password, // In production, hash this!
        name,
        role: 'admin',
        active: true
      })
      console.log(`\n✅ Success: New Admin account created for '${email}'.`)
    }

  } catch (error) {
    console.error('\n❌ Error creating admin account:', error)
  } finally {
    rl.close()
    process.exit(0)
  }
}

main()
