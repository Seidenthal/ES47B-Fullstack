import express from 'express';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security.js';
import { securityLogger } from '../config/logger.js';

const router = express.Router();

// Middleware de autenticação melhorado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  if (!token) {
    securityLogger.logAuthError(ip, userAgent, 'Token não fornecido');
    return res.status(401).json({ 
      success: false,
      message: 'Token de acesso requerido' 
    });
  }

  try {
    const decoded = jwt.verify(token, securityConfig.JWT_SECRET);
    req.user = decoded;
    req.clientInfo = { ip, userAgent };
    next();
  } catch (err) {
    console.error('Erro na verificação do JWT:', err.message);
    securityLogger.logAuthError(ip, userAgent, `Token inválido: ${err.message}`);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido' 
    });
  }
};

// Rota protegida de exemplo
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ 
    success: true,
    message: `Perfil do usuário ${req.user.username}`,
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// Rota para verificar se o token é válido
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    success: true,
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

export default router;
export { authenticateToken };
