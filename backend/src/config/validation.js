import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// Validações expandidas para atender requisitos do projeto
export const serverValidation = {
  // Validação rigorosa de email
  email: (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email é obrigatório' };
    }
    
    const trimmed = email.trim().toLowerCase();
    
    if (!validator.isEmail(trimmed)) {
      return { valid: false, error: 'Formato de email inválido' };
    }
    
    if (trimmed.length > 254) {
      return { valid: false, error: 'Email muito longo' };
    }
    
    return { valid: true, value: trimmed };
  },

  // Validação rigorosa de username
  username: (username) => {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username é obrigatório' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username deve ter pelo menos 3 caracteres' };
    }
    
    if (trimmed.length > 20) {
      return { valid: false, error: 'Username deve ter no máximo 20 caracteres' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return { valid: false, error: 'Username deve conter apenas letras, números e underscore' };
    }
    
    // Lista de usernames proibidos
    const forbidden = ['admin', 'root', 'user', 'test', 'null', 'undefined'];
    if (forbidden.includes(trimmed.toLowerCase())) {
      return { valid: false, error: 'Username não permitido' };
    }
    
    return { valid: true, value: trimmed };
  },

  // Validação rigorosa de senha
  password: (password) => {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Senha é obrigatória' };
    }
    
    if (password.length < 6) {
      return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    
    if (password.length > 128) {
      return { valid: false, error: 'Senha muito longa' };
    }
    
    // Verificar se não é uma senha muito comum
    const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: 'Senha muito comum, escolha uma senha mais segura' };
    }
    
    return { valid: true, value: password };
  },

  // Validação de ID de filme
  movieId: (movieId) => {
    if (!movieId) {
      return { valid: false, error: 'ID do filme é obrigatório' };
    }
    
    const id = parseInt(movieId, 10);
    
    if (isNaN(id) || id <= 0) {
      return { valid: false, error: 'ID do filme deve ser um número positivo válido' };
    }
    
    if (id > 999999999) {
      return { valid: false, error: 'ID do filme inválido' };
    }
    
    return { valid: true, value: id };
  },

  // Validação de título de filme
  movieTitle: (title) => {
    if (!title || typeof title !== 'string') {
      return { valid: false, error: 'Título do filme é obrigatório' };
    }
    
    const trimmed = title.trim();
    
    if (trimmed.length < 1) {
      return { valid: false, error: 'Título não pode estar vazio' };
    }
    
    if (trimmed.length > 200) {
      return { valid: false, error: 'Título muito longo' };
    }
    
    // Sanitizar HTML
    const sanitized = DOMPurify.sanitize(validator.escape(trimmed));
    
    return { valid: true, value: sanitized };
  },

  // Validação de URL de poster
  posterUrl: (url) => {
    if (!url) {
      return { valid: true, value: null }; // Poster é opcional
    }
    
    if (typeof url !== 'string') {
      return { valid: false, error: 'URL do poster deve ser uma string' };
    }
    
    const trimmed = url.trim();
    
    if (!validator.isURL(trimmed, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      return { valid: false, error: 'URL do poster inválida' };
    }
    
    if (trimmed.length > 500) {
      return { valid: false, error: 'URL do poster muito longa' };
    }
    
    return { valid: true, value: trimmed };
  },

  // Validação de query de busca
  searchQuery: (query) => {
    if (!query || typeof query !== 'string') {
      return { valid: false, error: 'Termo de busca é obrigatório' };
    }
    
    const trimmed = query.trim();
    
    if (trimmed.length < 1) {
      return { valid: false, error: 'Termo de busca não pode estar vazio' };
    }
    
    if (trimmed.length > 100) {
      return { valid: false, error: 'Termo de busca muito longo' };
    }
    
    // Sanitizar
    const sanitized = DOMPurify.sanitize(validator.escape(trimmed));
    
    return { valid: true, value: sanitized };
  }
};

// Middleware de validação universal
export const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    const sanitizedData = {};
    
    for (const [field, validator] of Object.entries(validationRules)) {
      const value = req.body[field] || req.params[field] || req.query[field];
      const result = validator(value);
      
      if (!result.valid) {
        errors.push(`${field}: ${result.error}`);
      } else {
        sanitizedData[field] = result.value;
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }
    
    req.validatedData = sanitizedData;
    next();
  };
};

export default serverValidation;
