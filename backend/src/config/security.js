import rateLimit from 'express-rate-limit';
import compression from 'compression';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

export const securityConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'segredo_super_secreto_producao_2025',
  JWT_EXPIRES_IN: '24h',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  LOGIN_RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  LOGIN_RATE_LIMIT_MAX_REQUESTS: 5,
  BCRYPT_ROUNDS: 12
};

// Rate limiter geral
export const generalRateLimit = rateLimit({
  windowMs: securityConfig.RATE_LIMIT_WINDOW,
  max: securityConfig.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para login
export const loginRateLimit = rateLimit({
  windowMs: securityConfig.LOGIN_RATE_LIMIT_WINDOW,
  max: securityConfig.LOGIN_RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de segurança com Helmet - temporariamente desabilitado para debug
export const securityMiddleware = (req, res, next) => {
  // Adicionando headers básicos de segurança manualmente
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Middleware de compressão
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

export const sanitize = {
  text: (input) => {
    if (!input || typeof input !== 'string') return '';
    return DOMPurify.sanitize(validator.escape(input.trim()));
  },
  
  email: (input) => {
    if (!input || typeof input !== 'string') return '';
    const email = input.trim().toLowerCase();
    return validator.isEmail(email) ? email : '';
  },
  
  username: (input) => {
    if (!input || typeof input !== 'string') return '';
    const username = input.trim();
    return /^[a-zA-Z0-9_]{3,20}$/.test(username) ? username : '';
  },
  
  integer: (input) => {
    const num = parseInt(input, 10);
    return isNaN(num) ? null : num;
  }
};

export const validate = {
  loginData: (data) => {
    const errors = [];
    
    if (!data.username) {
      errors.push('Username é obrigatório');
    } else if (!sanitize.username(data.username)) {
      errors.push('Username deve ter entre 3-20 caracteres e conter apenas letras, números e underscore');
    }
    
    if (!data.password) {
      errors.push('Senha é obrigatória');
    } else if (data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: {
        username: sanitize.username(data.username),
        password: data.password
      }
    };
  },
  
  favoriteData: (data) => {
    const errors = [];
    
    if (!data.movie_tmdb_id) {
      errors.push('ID do filme é obrigatório');
    } else if (!sanitize.integer(data.movie_tmdb_id)) {
      errors.push('ID do filme deve ser um número válido');
    }
    
    if (!data.title) {
      errors.push('Título do filme é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: {
        movie_tmdb_id: sanitize.integer(data.movie_tmdb_id),
        title: sanitize.text(data.title),
        poster_url: data.poster_url ? sanitize.text(data.poster_url) : null
      }
    };
  }
};
