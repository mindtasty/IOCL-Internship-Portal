const bcrypt = require('bcrypt');
const db = require('./src/config/db');

(async () => {
  const passwordHash = await bcrypt.hash('password', 10);
  await db.query(
    `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status, department_id, phone)
     VALUES (?, ?, 3, ?, ?, 'active', ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       role_id = excluded.role_id,
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       status = excluded.status,
       department_id = excluded.department_id,
       phone = excluded.phone`,
    ['hr@portal.com', passwordHash, 'HR', 'User', 2, '7777777777']
  );
  console.log('HR account ready: hr@portal.com / password');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
