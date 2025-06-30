import db from '../config/database.js';

export function getAllMovies() {
  try {
    const movies = db.prepare('SELECT * FROM movies ORDER BY year DESC').all();
    return movies;
  } catch (err) {
    console.error('Erro ao buscar filmes:', err);
    throw err;
  }
}

export function insertFavorite(userId, movieData) {
  try {
    const { movie_tmdb_id, title, poster_url } = movieData;
    
    // Verifica se já existe
    const existing = db.prepare(`
      SELECT id FROM favorites 
      WHERE user_id = ? AND movie_tmdb_id = ?
    `).get(userId, movie_tmdb_id);
    
    if (existing) {
      throw new Error('Este filme já está nos favoritos');
    }
    
    const sql = `
      INSERT INTO favorites (user_id, movie_tmdb_id, title, poster_url) 
      VALUES (?, ?, ?, ?)
    `;
    const info = db.prepare(sql).run(userId, movie_tmdb_id, title, poster_url);
    return info;
  } catch (err) {
    console.error('Erro ao inserir favorito:', err);
    throw err;
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
        poster_url,
        created_at
      FROM favorites 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const favorites = db.prepare(sql).all(userId);
    
    // Padroniza a estrutura para compatibilidade com dados da API TMDB
    return favorites.map(fav => ({
      ...fav,
      id: fav.movie_tmdb_id, // Usa o TMDB ID como ID principal
      movie_tmdb_id: fav.movie_tmdb_id,
      name: fav.title,
      title: fav.title,
      poster_path: fav.poster_url,
      poster_url: fav.poster_url
    }));
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    throw err;
  }
}

export function deleteFavorite(userId, movieTmdbId) {
  try {
    const sql = `
      DELETE FROM favorites 
      WHERE user_id = ? AND movie_tmdb_id = ?
    `;
    const result = db.prepare(sql).run(userId, movieTmdbId);
    return result;
  } catch (err) {
    console.error('Erro ao deletar favorito:', err);
    throw err;
  }
}

export function getFavoriteById(userId, movieTmdbId) {
  try {
    const sql = `
      SELECT * FROM favorites 
      WHERE user_id = ? AND movie_tmdb_id = ?
    `;
    return db.prepare(sql).get(userId, movieTmdbId);
  } catch (err) {
    console.error('Erro ao buscar favorito por ID:', err);
    throw err;
  }
}

export function getUserFavoritesCount(userId) {
  try {
    const sql = 'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?';
    const result = db.prepare(sql).get(userId);
    return result.count;
  } catch (err) {
    console.error('Erro ao contar favoritos:', err);
    throw err;
  }
}
