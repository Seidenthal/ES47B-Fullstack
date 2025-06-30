import db from './database.js';

// Sistema de logs de segurança
export const securityLogger = {
  // Log de tentativa de login
  logLogin: (userId, username, ip, userAgent, success, errorMessage = null) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO security_logs (user_id, action, ip_address, user_agent, success, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        userId || null,
        `LOGIN_ATTEMPT:${username || 'unknown'}`,
        ip || 'unknown',
        userAgent || 'unknown',
        success ? 1 : 0, // converter boolean para número
        errorMessage || null
      );
      
      console.log(`[SECURITY] Login attempt - User: ${username || 'unknown'}, IP: ${ip || 'unknown'}, Success: ${success}`);
    } catch (error) {
      console.error('Erro ao registrar log de login:', error);
    }
  },
  
  // Log de busca
  logSearch: (userId, searchQuery, ip, userAgent) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO security_logs (user_id, action, ip_address, user_agent, success)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        userId || null,
        `SEARCH:${searchQuery || 'empty'}`,
        ip || 'unknown',
        userAgent || 'unknown',
        1 // true como número
      );
      
      console.log(`[SECURITY] Search performed - User: ${userId || 'unknown'}, Query: ${searchQuery || 'empty'}, IP: ${ip || 'unknown'}`);
    } catch (error) {
      console.error('Erro ao registrar log de busca:', error);
    }
  },
  
  // Log de inserção
  logInsertion: (userId, action, itemId, ip, userAgent, success, errorMessage = null) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO security_logs (user_id, action, ip_address, user_agent, success, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        userId || null,
        `${action}:${itemId || 'unknown'}`,
        ip || 'unknown',
        userAgent || 'unknown',
        success ? 1 : 0, // converter boolean para número
        errorMessage || null
      );
      
      console.log(`[SECURITY] ${action} - User: ${userId || 'unknown'}, Item: ${itemId || 'unknown'}, IP: ${ip || 'unknown'}, Success: ${success}`);
    } catch (error) {
      console.error('Erro ao registrar log de inserção:', error);
    }
  },
  
  // Log de erro de autenticação
  logAuthError: (ip, userAgent, errorMessage) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO security_logs (action, ip_address, user_agent, success, error_message)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        'AUTH_ERROR',
        ip || 'unknown',
        userAgent || 'unknown',
        0, // false como número
        errorMessage || 'Unknown error'
      );
      
      console.log(`[SECURITY] Auth error - IP: ${ip || 'unknown'}, Error: ${errorMessage || 'Unknown error'}`);
    } catch (error) {
      console.error('Erro ao registrar log de erro de autenticação:', error);
    }
  },
  
  // Obter logs recentes (para monitoramento)
  getRecentLogs: (limit = 100) => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM security_logs 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      
      return stmt.all(limit);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }
};
