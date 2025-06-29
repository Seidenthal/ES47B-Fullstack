import express from 'express';
import cors from 'cors';
const app = express();

import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import movieRoutes from './routes/movieRoutes.js';


app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(protectedRoutes);
app.use(movieRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em ${PORT}`);
});
