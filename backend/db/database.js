const Database = require('better-sqlite3');
const db = new Database('./users.sqlite');

// Inicializa tabela se não existir
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`,
).run();

module.exports = db;
