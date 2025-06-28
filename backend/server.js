import express from 'express';
import cors from 'cors';
const app = express();

import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';

app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(protectedRoutes);

app.listen(3001, () =>
  console.log('Servidor rodando em http://localhost:3001'),
);
