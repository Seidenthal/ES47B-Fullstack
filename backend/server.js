import express from 'express';
import cors from 'cors';

import { 
  generalRateLimit, 
  loginRateLimit,
  compressionMiddleware
} from './src/config/security.js';

import { httpsConfig, createHttpsServer } from './src/config/https.js';

import authRoutes from './src/routes/auth.js';
import protectedRoutes from './src/routes/protected.js';
import movieRoutes from './src/routes/movieRoutes.js';

const app = express();

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'production') {
  app.use(httpsConfig.forceHttps);
}

app.use(httpsConfig.securityHeaders);
app.use(compressionMiddleware);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalRateLimit);
app.use('/login', loginRateLimit);
app.use('/register', loginRateLimit);

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip}`);
  next();
});

app.use(authRoutes);
app.use(protectedRoutes);
app.use(movieRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.use((req, res) => {
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
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Tentar criar servidor HTTPS se em produção
const httpsServer = createHttpsServer(app);

if (httpsServer && process.env.NODE_ENV === 'production') {
  httpsServer.listen(HTTPS_PORT, () => {
    console.log('='.repeat(50));
    console.log(`🔒 Servidor HTTPS rodando na porta ${HTTPS_PORT}`);
    console.log(`📅 Iniciado em: ${new Date().toISOString()}`);
    console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
  });
}

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
  console.log(`📅 Iniciado em: ${new Date().toISOString()}`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`⚠️  Para produção, use HTTPS na porta ${HTTPS_PORT}`);
  }
  console.log('='.repeat(50));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, fechando servidor...');
  server.close(() => {
    console.log('Servidor fechado');
    process.exit(0);
  });
});

export default app;
