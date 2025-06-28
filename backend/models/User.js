const db = require('../db/database');

function findByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function insertUser(username, password_hash) {
  return db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, password_hash);
}

module.exports = { findByUsername, insertUser };
