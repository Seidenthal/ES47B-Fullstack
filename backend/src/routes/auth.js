import express from 'express';
import jwt from 'jsonwebtoken';
import { findByUsername, insertUser, verifyPassword } from '../models/User.js';
import { validate, securityConfig } from '../config/security.js';
import { serverValidation, validateRequest } from '../config/validation.js';
import { securityLogger } from '../config/logger.js';

const router = express.Router();

// Middleware para capturar IP e User-Agent
const getClientInfo = (req) => ({
  ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
  userAgent: req.get('User-Agent') || 'Unknown'
});

// Rota de login com validação expandida
router.post('/login', 
  validateRequest({
    username: serverValidation.username,
    password: serverValidation.password
  }), 
  async (req, res) => {
    const { ip, userAgent } = getClientInfo(req);
    const { username, password } = req.validatedData;
    
    try {
      // Buscar usuário
      const user = findByUsername(username);
      if (!user) {
        securityLogger.logLogin(null, username, ip, userAgent, false, 'Usuário não encontrado');
        return res.status(401).json({ 
          success: false,
          message: 'Credenciais inválidas' 
        });
      }
      
      // Verificar senha
      const validPassword = verifyPassword(password, user.password_hash);
      if (!validPassword) {
        securityLogger.logLogin(user.id, username, ip, userAgent, false, 'Senha incorreta');
        return res.status(401).json({ 
          success: false,
          message: 'Credenciais inválidas' 
        });
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        securityConfig.JWT_SECRET,
        { expiresIn: securityConfig.JWT_EXPIRES_IN }
      );
      
      // Log de sucesso
      securityLogger.logLogin(user.id, username, ip, userAgent, true);
      
      res.json({ 
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
      
    } catch (err) {
      console.error('Erro no login:', err);
      securityLogger.logLogin(null, username, ip, userAgent, false, err.message);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor' 
      });
    }
  }
);

// Rota de registro com validação expandida
router.post('/register', 
  validateRequest({
    username: serverValidation.username,
    password: serverValidation.password
  }),
  async (req, res) => {
    const { ip, userAgent } = getClientInfo(req);
    
    try {
      const { username, password } = req.validatedData;
      
      // Verificar se usuário já existe
      const existingUser = findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Nome de usuário já existe' 
        });
      }
      
      // Criar usuário
      const newUser = insertUser(username, password);
      
      // Log de registro
      securityLogger.logInsertion(newUser.id, 'USER_REGISTER', username, ip, userAgent, true);
      
      res.status(201).json({ 
        success: true,
        message: 'Usuário criado com sucesso', 
        user: {
          id: newUser.id,
          username: newUser.username
        }
      });
      
    } catch (err) {
      console.error('Erro no registro:', err);
      res.status(400).json({ 
        success: false,
        message: err.message || 'Erro ao criar usuário' 
      });
    }
  }
);

// Rota de logout (invalida token no lado cliente)
router.post('/logout', (req, res) => {
  const { ip, userAgent } = getClientInfo(req);
  
  // Em um sistema mais robusto, manteríamos uma blacklist de tokens
  // Por simplicidade, apenas retornamos sucesso
  
  res.json({ 
    success: true,
    message: 'Logout realizado com sucesso' 
  });
});

export default router;
