import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

const SECRET = 'segredo_super_secreto';

router.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {

    console.error('Erro na verificação do JWT:', err.message);


    res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
});

router.get('/dados', (req, res) => {
  res.json({ message: `Você está autenticado como ${req.user.username}` });
});

export default router;
