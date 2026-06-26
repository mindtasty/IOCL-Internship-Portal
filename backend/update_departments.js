const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'data/internship_portal.sqlite'));

const departments = [
  { name: 'Human Resources',  code: 'HR'  },
  { name: 'Learning & Development', code: 'L&D' },
  { name: 'Information Systems', code: 'IS' },
  { name: 'Finance',          code: 'FIN' },
  { name: 'Operations',       code: 'OPS' },
  { name: 'Marketing',        code: 'MKT' },
];

db.serialize(() => {
  db.run('DELETE FROM departments', (err) => {
    if (err) return console.error('Delete failed:', err.message);
    console.log('Old departments cleared.');
  });

  const stmt = db.prepare(
    'INSERT INTO departments (name, code) VALUES (?, ?)'
  );

  departments.forEach(({ name, code }) => {
    stmt.run(name, code, (err) => {
      if (err) console.error(`Failed to insert ${name}:`, err.message);
      else console.log(`Added: ${name} (${code})`);
    });
  });

  stmt.finalize(() => {
    console.log('Done!');
    db.close();
  });
});