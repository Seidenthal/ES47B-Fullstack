// Arquivo: src/components/MovieList.js

import { useContext, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate

export default function MovieList() {
  const { state, dispatch } = useContext(AppContext);
  const { movies } = state; // Por enquanto, só precisamos dos filmes do estado global
  const navigate = useNavigate(); // Hook para fazer redirecionamento

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect será usado para buscar os filmes quando o componente montar
  useEffect(() => {
    const fetchMoviesFromBackend = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // Se não há token, o usuário não está logado.
      if (!token) {
        // Redireciona para a página de login após um breve momento
        setTimeout(() => navigate('/login'), 1500);
        setError('Você precisa estar logado para ver os filmes.');
        setLoading(false);
        return;
      }

      try {
        // A URL agora aponta para o seu backend
        const response = await fetch('http://localhost:3001/movies', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Se o token for inválido/expirado, o backend retornará um erro
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token'); // Limpa o token inválido
            setTimeout(() => navigate('/login'), 1500);
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
          }
          throw new Error('Não foi possível carregar os filmes.');
        }

        const data = await response.json();

        // ATENÇÃO: Seu backend retorna o array diretamente. Não usamos ".results"
        dispatch({
          type: 'SET_MOVIES',
          payload: data,
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesFromBackend();
  }, [dispatch, navigate]); // Adicionados como dependências

  // Renderização de Loading e Erro
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" textAlign="center" sx={{ mt: 5 }}>{error}</Typography>;
  }

  // Renderização da lista de filmes ou mensagem de "nenhum encontrado"
  if (!movies || movies.length === 0) {
    return <Typography variant="body1" textAlign="center" sx={{ mt: 5 }}>Nenhum filme encontrado no seu banco de dados.</Typography>;
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
      gap={3}
    >
      {movies.map((item) => (
        <MovieCard key={`${item.id}-${item.title}`} item={item} />
      ))}
    </Box>
  );
}