import express from 'express';
import { getAllMovies, getFavoritesByUserId, insertFavorite, deleteFavorite } from '../models/Movie.js';
import { authenticateToken } from './protected.js';
import { validate } from '../config/security.js';
import { serverValidation, validateRequest } from '../config/validation.js';
import { securityLogger } from '../config/logger.js';

const router = express.Router();

// Middleware para capturar informações do cliente
const getClientInfo = (req) => ({
  ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
  userAgent: req.get('User-Agent') || 'Unknown'
});

// Rota pública para buscar filmes (sem autenticação)
router.get('/movies', (req, res) => {
  try {
    const movies = getAllMovies();
    res.json({
      success: true,
      data: movies
    });
  } catch (err) {
    console.error('Erro ao buscar filmes:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar filmes no servidor' 
    });
  }
});

// Rota para buscar favoritos do usuário
router.get('/favorites', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { ip, userAgent } = getClientInfo(req);
    
    const favoriteMovies = getFavoritesByUserId(userId);
    
    // Log da busca
    securityLogger.logSearch(userId, 'favorites', ip, userAgent);
    
    res.json({
      success: true,
      data: favoriteMovies
    });
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar favoritos.' 
    });
  }
});

// Rota para adicionar favorito com validação expandida
router.post('/favorites', 
  authenticateToken,
  validateRequest({
    movie_tmdb_id: serverValidation.movieId,
    title: serverValidation.movieTitle,
    poster_url: serverValidation.posterUrl
  }),
  (req, res) => {
    try {
      const userId = req.user.id;
      const { ip, userAgent } = getClientInfo(req);
      const movieData = req.validatedData;
      
      insertFavorite(userId, movieData);
      
      // Log da inserção
      securityLogger.logInsertion(userId, 'ADD_FAVORITE', movieData.movie_tmdb_id, ip, userAgent, true);
      
      res.status(201).json({ 
        success: true,
        message: 'Filme favoritado com sucesso!' 
      });
      
    } catch (err) {
      console.error('Erro na rota POST /favorites:', err);
      const { ip, userAgent } = getClientInfo(req);
      
      securityLogger.logInsertion(req.user?.id, 'ADD_FAVORITE_ERROR', 'unknown', ip, userAgent, false, err.message);
      
      if (err.message === 'Este filme já está nos favoritos') {
        return res.status(409).json({ 
          success: false,
          message: err.message 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Erro ao salvar favorito.' 
      });
    }
  }
);

// Rota para remover favorito com validação
// Rota para remover favorito com validação
router.delete('/favorites/:movieId', 
  authenticateToken,
  validateRequest({
    movieId: serverValidation.movieId
  }),
  (req, res) => {
    try {
      const userId = req.user.id;
      const movieId = req.validatedData.movieId;
      const { ip, userAgent } = getClientInfo(req);
      
      const result = deleteFavorite(userId, movieId);
      
      if (result.changes === 0) {
        securityLogger.logInsertion(userId, 'REMOVE_FAVORITE_FAILED', movieId, ip, userAgent, false, 'Favorito não encontrado');
        return res.status(404).json({ 
          success: false,
          message: 'Favorito não encontrado.' 
        });
      }
      
      // Log da remoção
      securityLogger.logInsertion(userId, 'REMOVE_FAVORITE', movieId, ip, userAgent, true);
      
      res.status(200).json({ 
        success: true,
        message: 'Favorito removido com sucesso!' 
      });
      
    } catch (err) {
      console.error('Erro na rota DELETE /favorites:', err);
      const { ip, userAgent } = getClientInfo(req);
      
      securityLogger.logInsertion(req.user?.id, 'REMOVE_FAVORITE_ERROR', req.params.movieId, ip, userAgent, false, err.message);
      
      res.status(500).json({ 
        success: false,
        message: 'Erro ao remover favorito.' 
      });
    }
  }
);

// Rota para buscar filmes com validação de query opcional
router.get('/search', 
  authenticateToken,
  (req, res) => {
    try {
      const userId = req.user.id;
      const { q: query } = req.query;
      const { ip, userAgent } = getClientInfo(req);
      
      // Validar query se fornecida
      if (query) {
        const validation = serverValidation.searchQuery(query);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: validation.error
          });
        }
      }
      
      // Log da busca
      securityLogger.logSearch(userId, query || 'empty_query', ip, userAgent);
      
      // Esta rota pode ser expandida para implementar busca personalizada
      // Por enquanto, retorna uma resposta básica
      res.json({
        success: true,
        message: 'Busca registrada com sucesso',
        query: query || ''
      });
      
    } catch (err) {
      console.error('Erro na busca:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao realizar busca.' 
      });
    }
  }
);

export default router;
