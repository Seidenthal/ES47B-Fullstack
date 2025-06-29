import db from '../db/database.js';

export function findByUsername(username) {
  try {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  } catch (err) {
    console.error('Erro ao buscar usuário', err)
    throw err;
  }
}

export function insertUser(username, password_hash) {
  try {
    const transaction = db.transaction((user, pass) => {
      const info = db
        .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .run(user, pass);

      const userId = info.lastInsertRowid;

      return db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId)
    });

    return transaction(username, password_hash);
  } catch (err) {
    console.error('Erro ao inserir usuário', err);

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Nome de usuário já existe');
    }
    throw err;
  }
}
