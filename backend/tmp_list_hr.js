const db = require('./src/config/db');

(async () => {
  const rows = await db.query("SELECT u.id,u.email,u.first_name,u.last_name,r.name as role FROM users u JOIN roles r ON u.role_id=r.id WHERE r.name = 'HR' ORDER BY u.id");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
