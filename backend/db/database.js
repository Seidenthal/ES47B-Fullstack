import Database from 'better-sqlite3';

const db = new Database('./db.sqlite', { verbose: console.log});



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

// Inicializa tabela de favoritos se não existir
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,           
    movie_tmdb_id INTEGER NOT NULL,     
    title TEXT NOT NULL,                
    poster_url TEXT,
    UNIQUE(user_id, movie_tmdb_id) 
  )
`,
).run();

export default db;
