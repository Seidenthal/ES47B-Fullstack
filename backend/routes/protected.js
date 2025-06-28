import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

const SECRET = 'segredo_super_secreto';

router.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
});

router.get('/dados', (req, res) => {
  res.json({ message: `Você está autenticado como ${req.user.username}` });
});

export default router;
