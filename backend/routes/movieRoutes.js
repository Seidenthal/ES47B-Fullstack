import express from 'express';
import jwt from 'jsonwebtoken';
import { getAllMovies,getFavoritesByUserId, insertFavorite, deleteFavorite } from '../models/Movie.js';

const router = express.Router();
const SECRET = 'segredo_super_secreto';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro na verificação do JWT:', err.message);
    res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

router.get('/movies', (req, res) => {
    console.log('Rota Get/movies foi chamada')
    try {
        const movies = getAllMovies();
        res.json(movies)
    } catch (err) {

        console.error('Erro no bloco try / catch')
        res.status(500).json({ message: 'Erro ao buscar filmes no servidor' });
    }
});

router.get('/favorites', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id; 

    const favoriteMovies = getFavoritesByUserId(userId);

    res.json(favoriteMovies); 
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar favoritos.' });
  }
});

router.post('/favorites', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;   
    const movieData = req.body; 

    if (!movieData || !movieData.movie_tmdb_id) {
      return res.status(400).json({ message: 'ID do filme é obrigatório.' });
    }

    insertFavorite(userId, movieData);

    res.status(201).json({ message: 'Filme favoritado com sucesso!' });
  } catch (err) {
    console.error('Erro na rota POST /favorites:', err);
    if (err.message === 'Este filme já está nos favoritos') {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: 'Erro ao salvar favorito.' });
  }
});

router.delete('/favorites/:movieId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    console.log(`DELETE /favorites/${movieId} - UserId: ${userId}`);

    if (!movieId) {
      return res.status(400).json({ message: 'ID do filme é obrigatório.' });
    }

    const result = deleteFavorite(userId, movieId);
    console.log('Resultado da deleção:', result);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Favorito não encontrado.' });
    }

    res.status(200).json({ message: 'Favorito removido com sucesso!' });
  } catch (err) {
    console.error('Erro na rota DELETE /favorites:', err);
    res.status(500).json({ message: 'Erro ao remover favorito.' });
  }
});

export default router;