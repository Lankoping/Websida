import { db } from '../src/server/db/index'
import { users, posts } from '../src/server/db/schema'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('🌱 Seeding database...')

  try {
    // Check if admin already exists
    const existing = await db.select().from(users).limit(1)
    if (existing.length > 0) {
      console.log('users already exist, skipping seed')
      return
    }

    // Create admin user
    // Note: In production hashing should be done with bcrypt/argon2
    // Here we use plain text for simplicity per request context or simple hash
    const passwordHash = 'admin123' 
    
    await db.insert(users).values({
      email: 'admin@lankoping.se',
      passwordHash: passwordHash,
      name: 'Admin User',
      role: 'admin',
    })

    console.log('✅ Admin user created: admin@lankoping.se / admin123')
    
    // Create some initial posts
    await db.insert(posts).values([
      {
        title: 'Välkommen till Lanköping!',
        slug: 'valkommen-till-lankoping',
        content: 'Detta är det första inlägget på vår nya hemsida.',
        excerpt: 'Välkommen till vår nya digitala plattform.',
        type: 'blog',
        published: true,
        authorId: 1
      },
      {
        title: 'Nyheter: Lansering',
        slug: 'nyheter-lansering',
        content: 'Vi lanserar nu vår nya hemsida med nyheter och blogg.',
        excerpt: 'Lansering av hemsidan.',
        type: 'news',
        published: true,
        authorId: 1
      }
    ])

    console.log('✅ Sample posts created')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

main()
