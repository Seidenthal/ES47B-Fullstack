import db from '../db/database.js';

export function getAllMovies() {
    try {
        const movies = db.prepare('SELECT * FROM movies ORDER BY year DESC').all();
        return movies;
    } catch (err) {
        console.error('Erro ao buscar filmes', err)
        throw err;
    }
}

export function insertFavorite(userId, movieData) {
    try {
        const { movie_tmdb_id, title, poster_url } = movieData;
        const sql = `
      INSERT INTO favorites (user_id, movie_tmdb_id, title, poster_url) 
      VALUES (?, ?, ?, ?)
    `;
        const info = db.prepare(sql).run(userId, movie_tmdb_id, title, poster_url);
        return info;
    } catch (err) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
            console.error('Erro ao inserir favorito:', err);
            throw err;
        }
    }
}

export function getFavoritesByUserId(userId) {
    try {
        const sql = `
      SELECT 
        id, 
        user_id, 
        movie_tmdb_id, 
        title, 
        poster_url 
      FROM favorites 
      WHERE user_id = ?
    `;
        return db.prepare(sql).all(userId);
    } catch (err) {
        console.error('Erro ao buscar favoritos', err);
        throw err;
    }
}
