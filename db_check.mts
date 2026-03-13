import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/workspaces/Websida/.env' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    console.log('Tables:', res.rows.map((r: any) => r.tablename));
    
    try {
      const mig = await pool.query("SELECT * FROM __drizzle_migrations ORDER BY created_at");
      console.log('Migrations:', JSON.stringify(mig.rows, null, 2));
    } catch {
      console.log('No __drizzle_migrations table found');
    }

    // Check columns on key tables
    for (const table of ['users', 'events', 'tickets', 'activity_logs', 'agreements', 'avgangs_requests', 'stadgar', 'ticket_types', 'posts']) {
      try {
        const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`);
        console.log(`\nColumns in ${table}:`, cols.rows.map((r: any) => r.column_name).join(', '));
      } catch {
        console.log(`Table ${table} not accessible`);
      }
    }
  } catch(e: any) {
    console.error('Error:', e.message);
  }
  await pool.end();
}

main();
