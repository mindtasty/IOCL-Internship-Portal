const bcrypt = require('bcrypt');
const db = require('./src/config/db');

(async () => {
  const passwordHash = await bcrypt.hash('password', 10);
  const userResult = await db.query(
    `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status, department_id, phone)
     VALUES (?, ?, 5, ?, ?, 'active', ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       role_id = excluded.role_id,
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       status = excluded.status,
       department_id = excluded.department_id,
       phone = excluded.phone`,
    ['mentor@portal.com', passwordHash, 'Mentor', 'User', 2, '8888888888']
  );

  const mentorUserId = userResult.insertId || (await db.query("SELECT id FROM users WHERE email = 'mentor@portal.com'"))[0].id;
  await db.query(
    `INSERT INTO mentors (user_id, department_id, specialization, max_interns)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       department_id = excluded.department_id,
       specialization = excluded.specialization,
       max_interns = excluded.max_interns`,
    [mentorUserId, 2, 'Software Engineering', 5]
  );

  console.log('Mentor account ready: mentor@portal.com / password');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
