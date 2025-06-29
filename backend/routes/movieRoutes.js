import express from 'express';
import { getAllMovies } from '../models/Movie.js';

const router = express.Router();

router.get('/movies', (req, res) => {
    console.log('Rota Get/movies foi chamada')
    try {
        const movies = getAllMovies();
        res.json(movies)
    } catch (err) {

        console.error('Erro no bloco try / catch')
        res.status(500).json({ message: 'Erro ao buscar filmes no servidor' });
    }
});

export default router;