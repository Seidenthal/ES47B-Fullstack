import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados com pool de conexões
const dbPath = path.join(__dirname, '../../db.sqlite');

const db = new Database(dbPath, { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : null,
  // Pool de conexões configurado
  timeout: 5000,
  readonly: false
});

// Configuração de WAL mode para melhor performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');
db.pragma('temp_store = memory');

// Inicializa tabelas se não existirem
const initializeTables = () => {
  // Tabela de usuários
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Tabela de favoritos
  db.prepare(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,           
      movie_tmdb_id INTEGER NOT NULL,     
      title TEXT NOT NULL,                
      poster_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, movie_tmdb_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();
  // Tabela de filmes (catálogo local)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE,
      title TEXT NOT NULL,
      overview TEXT,
      poster_path TEXT,
      release_date TEXT,
      year INTEGER,
      genre_ids TEXT,
      vote_average REAL,
      vote_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Tabela de logs de segurança
  db.prepare(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      error_message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log('Tabelas do banco de dados inicializadas com sucesso');
};

// Inicializar tabelas
initializeTables();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Fechando conexão com o banco de dados...');
  db.close();
  process.exit(0);
});

export default db;
