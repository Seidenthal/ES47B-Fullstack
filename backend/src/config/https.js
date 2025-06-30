import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração HTTPS
export const httpsConfig = {
  // Certificados auto-assinados para desenvolvimento
  // Em produção, use certificados válidos
  getOptions: () => {
    const certPath = path.join(__dirname, '../../certs');
    
    try {
      return {
        key: fs.readFileSync(path.join(certPath, 'server.key')),
        cert: fs.readFileSync(path.join(certPath, 'server.cert'))
      };
    } catch (error) {
      console.warn('⚠️  Certificados HTTPS não encontrados. Executando em HTTP.');
      console.warn('Para produção, configure certificados SSL válidos.');
      return null;
    }
  },
  
  // Middleware para forçar HTTPS em produção
  forceHttps: (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  },
  
  // Headers de segurança para HTTPS
  securityHeaders: (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Forwarded-Proto', 'https');
    }
    next();
  }
};

// Função para criar servidor HTTPS
export const createHttpsServer = (app) => {
  const options = httpsConfig.getOptions();
  
  if (options && process.env.NODE_ENV === 'production') {
    return https.createServer(options, app);
  }
  
  return null;
};

export default httpsConfig;
