import db from '../db/database.js';

export function getAllMovies(){
    try{
        const movies = db.prepare('SELECT * FROM movies ORDER BY year DESC').all();
        return movies;
    } catch (err){
        console.error('Erro ao buscar filmes', err)
        throw err;
    }
}

//funções de procurar por titulo e tals