const { createClient } = require('@libsql/client');
require('dotenv').config();

let client = null;

function getClient() {
  if (!client) {
    client = createClient({
      url:       process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function query(sql, params = []) {
  const db = getClient();
  const result = await db.execute({ sql, args: params });

  // SELECT queries → return rows array
  if (/^\s*(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(sql)) {
    return result.rows;
  }

  // INSERT/UPDATE/DELETE → return object matching existing code expectations
  return {
    insertId:     Number(result.lastInsertRowid),
    affectedRows: result.rowsAffected,
    changes:      result.rowsAffected,
  };
}

async function initializeDatabase() {
  const db = getClient();

  // Run the full schema as individual statements
  const statements = getBootstrapStatements();
  for (const sql of statements) {
    if (sql.trim()) await db.execute(sql);
  }

  console.log('Turso database ready.');
}

function getBootstrapStatements() {
  return [
    `CREATE TABLE IF NOT EXISTS roles (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`,
    `INSERT OR IGNORE INTO roles (id, name) VALUES (1,'Admin'),(2,'Student'),(3,'HR'),(4,'HOD'),(5,'Mentor'),(6,'L&D')`,
    `CREATE TABLE IF NOT EXISTS departments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      code       TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id       INTEGER NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      status        TEXT DEFAULT 'active',
      department_id INTEGER DEFAULT NULL,
      phone         TEXT DEFAULT NULL,
      created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id)       REFERENCES roles(id),
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mentors (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL UNIQUE,
      department_id  INTEGER NOT NULL,
      specialization TEXT DEFAULT NULL,
      max_interns    INTEGER DEFAULT 5,
      created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id       INTEGER NOT NULL,
      department_id    INTEGER NOT NULL,
      status           TEXT DEFAULT 'Draft',
      company_name     TEXT NOT NULL,
      internship_title TEXT NOT NULL,
      start_date       TEXT NOT NULL,
      end_date         TEXT NOT NULL,
      remarks          TEXT DEFAULT NULL,
      created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS application_documents (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      document_type  TEXT NOT NULL,
      file_name      TEXT NOT NULL,
      file_path      TEXT NOT NULL,
      status         TEXT DEFAULT 'Pending',
      remarks        TEXT DEFAULT NULL,
      uploaded_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS mentor_assignments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL UNIQUE,
      mentor_id      INTEGER NOT NULL,
      assigned_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id)      REFERENCES mentors(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      date           TEXT NOT NULL,
      status         TEXT NOT NULL,
      marked_by      INTEGER NOT NULL,
      remarks        TEXT DEFAULT NULL,
      marked_at      TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by)      REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (application_id, date)
    )`,
    `CREATE TABLE IF NOT EXISTS weekly_reports (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      week_number    INTEGER NOT NULL,
      tasks_performed TEXT NOT NULL,
      what_learned   TEXT NOT NULL,
      challenges_faced TEXT NOT NULL,
      comments       TEXT DEFAULT NULL,
      status         TEXT DEFAULT 'Submitted',
      submitted_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      UNIQUE (application_id, week_number)
    )`,
    `CREATE TABLE IF NOT EXISTS weekly_report_comments (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      comment   TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      status     TEXT DEFAULT 'Unread',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS certificates (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL UNIQUE,
      file_name      TEXT NOT NULL,
      file_path      TEXT NOT NULL,
      uploaded_by    INTEGER NOT NULL,
      uploaded_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by)    REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS internship_summaries (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id    INTEGER NOT NULL UNIQUE,
      technical_skills  INTEGER NOT NULL,
      learning_ability  INTEGER NOT NULL,
      communication     INTEGER NOT NULL,
      discipline        INTEGER NOT NULL,
      attendance_score  INTEGER NOT NULL,
      evaluation_remarks TEXT DEFAULT NULL,
      file_path         TEXT DEFAULT NULL,
      evaluated_by      INTEGER NOT NULL,
      created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (evaluated_by)   REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER DEFAULT NULL,
      action_by      INTEGER NOT NULL,
      action_name    TEXT NOT NULL,
      description    TEXT NOT NULL,
      timestamp      TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
      FOREIGN KEY (action_by)      REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];
}

module.exports = { query, initializeDatabase };