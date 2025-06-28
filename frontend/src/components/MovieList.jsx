import { useContext, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';

export default function MovieList() {
  const { state, dispatch } = useContext(AppContext);
  const { movies, searchQuery, genre } = state;

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async (newPage) => {
    if (loading) return;

    setLoading(true);
    try {
      const apiKey = 'afa87e0b93ec3b58cd0c858af4c4c399';
      let url = '';

      if (searchQuery) {
        // Busca por nome
        url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
          searchQuery,
        )}&language=pt-BR&page=${newPage}`;
      } else if (
        genre &&
        ((genre.movieId !== 0 && genre.movieId !== undefined) ||
          (genre.tvId !== 0 && genre.tvId !== undefined))
      ) {
        const urls = [];

        if (genre.movieId !== 0 && genre.movieId !== undefined) {
          urls.push(
            `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre.movieId}&language=pt-BR&page=${newPage}`
          );
        }

        if (genre.tvId !== 0 && genre.tvId !== undefined) {
          urls.push(
            `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genre.tvId}&language=pt-BR&page=${newPage}`
          );
        }

        const results = [];

        for (const url of urls) {
          const res = await fetch(url);
          const data = await res.json();
          const type = url.includes('/movie') ? 'movie' : 'tv';

          const formattedResults = data.results.map((item) => ({
            ...item,
            media_type: item.media_type || type,
          }));

          results.push(...formattedResults);
        }

        dispatch({
          type: newPage === 1 ? 'SET_MOVIES' : 'ADD_MOVIES',
          payload: results,
        });

        setPage(newPage);
        setLoading(false);
        return;
      } else {
        // Tendências da semana
        url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=pt-BR&page=${newPage}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const results = data.results
        .filter(
          (item) =>
            item.media_type === 'movie' ||
            item.media_type === 'tv' ||
            item.title ||
            item.name,
        )
        .map((item) => ({
          ...item,
          media_type: item.media_type || (genre?.movieId ? 'movie' : 'tv'),
        }));

      dispatch({
        type: newPage === 1 ? 'SET_MOVIES' : 'ADD_MOVIES',
        payload: results,
      });

      setPage(newPage);
    } catch (err) {
      console.error('Erro ao carregar mais filmes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carrega ao montar ou ao mudar busca/filtro
  useEffect(() => {
    setPage(1);
    fetchMovies(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, genre]);

  // Rola automaticamente para carregar mais
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight &&
        !loading
      ) {
        fetchMovies(page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, loading, searchQuery, genre]);

  if (!movies || movies.length === 0) {
    return (
      <Typography variant="body1">Nenhum resultado encontrado.</Typography>
    );
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
      gap={2}
    >
      {movies.map((item) => (
        <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
      ))}
    </Box>
  );
}
