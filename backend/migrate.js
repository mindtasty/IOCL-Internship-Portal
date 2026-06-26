require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dialect, initializeDatabase, query } = require('./src/config/db');

async function runMigration() {
  try {
    if (dialect === 'sqlite') {
      await initializeDatabase();
    } else {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const statements = sql.split(/;\s*\n/).map((statement) => statement.trim()).filter(Boolean);

      for (const statement of statements) {
        if (statement.startsWith('--') || statement.toUpperCase().startsWith('SET')) continue;
        await query(statement);
      }
    }

    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
