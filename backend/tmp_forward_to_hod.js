const db = require('./src/config/db');

(async () => {
  await db.query("UPDATE applications SET status = 'Forwarded To HOD' WHERE id = 1");
  await db.query("INSERT INTO activity_logs (application_id, action_by, action_name, description) VALUES (1, 1, 'Forwarded To HOD', 'Application forwarded to HOD for department approval.')");
  console.log('Application 1 forwarded to HOD');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
