const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@libsql/client');

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`Connecting to database at: ${url}`);

const db = createClient({
  url: url,
  authToken: authToken,
});

async function main() {
  try {
    // Enable foreign keys
    await db.execute('PRAGMA foreign_keys = ON;');

    console.log('Creating blog_categories table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating blogs table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT,
        cover_image_url TEXT,
        author TEXT DEFAULT 'Admin',
        category TEXT,
        tags TEXT,
        meta_title TEXT,
        meta_description TEXT,
        og_image_url TEXT,
        status TEXT DEFAULT 'draft',
        featured INTEGER DEFAULT 0,
        reading_time INTEGER,
        published_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert a default category if none exist
    const categoriesResult = await db.execute('SELECT COUNT(*) as count FROM blog_categories');
    const count = categoriesResult.rows[0].count;
    if (count === 0) {
      console.log('Inserting default categories...');
      const categories = [
        { id: 'cat-1', name: 'Real Estate', slug: 'real-estate' },
        { id: 'cat-2', name: 'Wayanad Projects', slug: 'wayanad-projects' },
        { id: 'cat-3', name: 'Calicut Projects', slug: 'calicut-projects' },
      ];
      for (const cat of categories) {
        await db.execute({
          sql: 'INSERT INTO blog_categories (id, name, slug) VALUES (?, ?, ?)',
          args: [cat.id, cat.name, cat.slug],
        });
      }
      console.log('Default categories inserted successfully!');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();
