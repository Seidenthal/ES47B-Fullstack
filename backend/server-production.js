import express from 'express';
import cors from 'cors';
import compression from 'compression';

import authRoutes from './src/routes/auth.js';
import protectedRoutes from './src/routes/protected.js';
import movieRoutes from './src/routes/movieRoutes.js';

import { cacheMiddleware } from './src/config/cache.js';

const app = express();

app.set('trust proxy', 1);

app.use(compression({
  level: 6,
  threshold: 1024,
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://seu-dominio.com'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/health', cacheMiddleware(1 * 60 * 1000));
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api', movieRoutes);

app.use(authRoutes);
app.use(protectedRoutes);
app.use(movieRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/dev/info', (req, res) => {
    res.json({
      memory: process.memoryUsage(),
      platform: process.platform,
      version: process.version,
      uptime: process.uptime()
    });
  });
}

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📅 Iniciado em: ${new Date().toISOString()}`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS: ${process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'}`);
  console.log('='.repeat(50));
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} recebido, fechando servidor...`);
  server.close(() => {
    console.log('Servidor fechado graciosamente');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('Forçando fechamento do servidor...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
