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
  (req, res) => {
    try {
      const userId = req.user.id;
      const { ip, userAgent } = getClientInfo(req);
      
      // Extrair dados do body com flexibilidade
      const movieId = req.body.movieId || req.body.movie_tmdb_id || req.body.id;
      const title = req.body.title;
      const posterPath = req.body.poster_path || req.body.posterPath || req.body.poster_url || '';
      
      // Validações básicas
      if (!movieId || !title) {
        return res.status(400).json({
          success: false,
          message: 'movieId e title são obrigatórios'
        });
      }
      
      if (typeof movieId !== 'number' && isNaN(parseInt(movieId))) {
        return res.status(400).json({
          success: false,
          message: 'movieId deve ser um número válido'
        });
      }
      
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'title deve ser uma string não vazia'
        });
      }
      
      // Adaptar os dados para o formato esperado pelo modelo
      const movieData = {
        movie_tmdb_id: parseInt(movieId),
        title: title.trim(),
        poster_url: posterPath
      };
      
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
router.delete('/favorites/:movieId', 
  authenticateToken,
  (req, res) => {
    try {
      const userId = req.user.id;
      const movieIdParam = req.params.movieId;
      
      // Validar o parâmetro movieId
      const validation = serverValidation.movieId(movieIdParam);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
      
      const movieId = validation.value;
      const { ip, userAgent } = getClientInfo(req);
      
      console.log(`DEBUG: Tentando deletar favorito - userId: ${userId}, movieId: ${movieId}`);
      
      const result = deleteFavorite(userId, movieId);
      console.log(`DEBUG: Resultado da deleção:`, result);
      
      if (result.changes === 0) {
        console.log('DEBUG: Nenhuma linha foi afetada na deleção');
        return res.status(404).json({ 
          success: false,
          message: 'Favorito não encontrado.' 
        });
      }
      
      console.log('DEBUG: Favorito deletado com sucesso');
      
      res.status(200).json({ 
        success: true,
        message: 'Favorito removido com sucesso!' 
      });
      
    } catch (err) {
      console.error('Erro na rota DELETE /favorites:', err);
      
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
