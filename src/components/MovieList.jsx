import { useContext, useEffect, useRef, useState } from 'react';
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
      let url = '';

      if (searchQuery) {
        url = `https://api.themoviedb.org/3/search/multi?api_key=afa87e0b93ec3b58cd0c858af4c4c399&query=${encodeURIComponent(
          searchQuery
        )}&language=pt-BR&page=${newPage}`;
      } else {
        url = `https://api.themoviedb.org/3/trending/all/week?api_key=afa87e0b93ec3b58cd0c858af4c4c399&language=pt-BR&page=${newPage}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const filteredResults = data.results.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      dispatch({
        type: newPage === 1 ? 'SET_MOVIES' : 'ADD_MOVIES',
        payload: filteredResults,
      });

      setPage(newPage);
    } catch (err) {
      console.error('Erro ao carregar mais filmes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Quando a busca mudar, reseta tudo
    setPage(1);
    fetchMovies(1);
  }, [searchQuery]);

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
  }, [page, loading, searchQuery]);

  // FILTRO POR NOME E GÊNERO
  const nameFiltered =
    searchQuery.trim() === ''
      ? movies
      : movies.filter((item) => {
          const title = item.title || item.name || '';
          return title.toLowerCase().includes(searchQuery.toLowerCase());
        });

  const filteredResults = nameFiltered.filter((item) => {
    if (!genre || (genre.movieId === 0 && genre.tvId === 0)) return true;

    const isMovie = item.media_type === 'movie' || item.title;
    const selectedGenreId = isMovie ? genre.movieId : genre.tvId;

    return item.genre_ids?.includes(selectedGenreId);
  });

  if (filteredResults.length === 0) {
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
      {filteredResults.map((item) => (
        <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
      ))}
    </Box>
  );
}
