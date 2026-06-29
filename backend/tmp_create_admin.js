const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'data/internship_portal.sqlite'));

(async () => {
  const passwordHash = await bcrypt.hash('password', 10);
  db.run(
    `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status)
     VALUES (?, ?, 1, 'Admin', 'User', 'active')
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       role_id       = excluded.role_id,
       status        = excluded.status`,
    ['admin@portal.com', passwordHash],
    function (err) {
      if (err) console.error('Error:', err.message);
      else console.log('Done! Login: admin@portal.com / password');
      db.close();
    }
  );
})();