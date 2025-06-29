import express from 'express';
import { getAllMovies,getFavoritesByUserId, insertFavorite } from '../models/Movie.js';
import protectRoute from './protected.js';

const router = express.Router();

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

router.get('/favorites', protectRoute, (req, res) => {
  try {
    const userId = req.user.id; 

    const favoriteMovies = getFavoritesByUserId(userId);

    res.json(favoriteMovies); 
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar favoritos.' });
  }
});

router.post('/favorites', protectRoute, (req, res) => {
  try {
    const userId = req.user.id;   
    const movieData = req.body; 

    if (!movieData || !movieData.movie_tmdb_id) {
      return res.status(400).json({ message: 'ID do filme é obrigatório.' });
    }

    insertFavorite(userId, movieData);

    res.status(201).json({ message: 'Filme favoritado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar favorito.' });
  }
});

export default router;