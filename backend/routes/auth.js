import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByUsername, insertUser } from '../models/User.js';

const router = express.Router();
const SECRET = 'segredo_super_secreto';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Preencha todos os campos' });

  const user = findByUsername(username); 
  if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
    expiresIn: '1h',
  });
  res.json({ token });
});

// Rota para registrar um usuário teste
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const newUser = insertUser(username, hash); 
    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Erro ao criar usuário (talvez já exista)' });
  }
});

export default router;
