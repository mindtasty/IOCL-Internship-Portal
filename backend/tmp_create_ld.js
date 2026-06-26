const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/internship_portal.sqlite');
const db = new sqlite3.Database(dbPath);

(async () => {
  const passwordHash = await bcrypt.hash('password', 10);

  db.run(
    `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status)
     VALUES (?, ?, 6, 'L&D', 'Admin', 'active')
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       role_id       = excluded.role_id`,
    ['ld@portal.com', passwordHash],
    function (err) {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log('Done! Login with: ld@portal.com / password');
      }
      db.close();
    }
  );
})();