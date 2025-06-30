import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import { securityConfig } from '../config/security.js';

export function findByUsername(username) {
  try {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    throw err;
  }
}

export function findById(id) {
  try {
    return db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(id);
  } catch (err) {
    console.error('Erro ao buscar usuário por ID:', err);
    throw err;
  }
}

export function insertUser(username, password) {
  try {
    const transaction = db.transaction((user, pass) => {
      // Hash da senha com salt rounds configurado
      const saltRounds = securityConfig.BCRYPT_ROUNDS;
      const password_hash = bcrypt.hashSync(pass, saltRounds);
      
      const info = db
        .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .run(user, password_hash);

      const userId = info.lastInsertRowid;

      return db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(userId);
    });

    return transaction(username, password);
  } catch (err) {
    console.error('Erro ao inserir usuário:', err);

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Nome de usuário já existe');
    }
    throw err;
  }
}

export function verifyPassword(password, hash) {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error('Erro ao verificar senha:', err);
    return false;
  }
}

export function updatePassword(userId, newPassword) {
  try {
    const saltRounds = securityConfig.BCRYPT_ROUNDS;
    const password_hash = bcrypt.hashSync(newPassword, saltRounds);
    
    const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(password_hash, userId);
    
    return result.changes > 0;
  } catch (err) {
    console.error('Erro ao atualizar senha:', err);
    throw err;
  }
}
