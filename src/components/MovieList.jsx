import { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';

export default function MovieList() {
  const { state } = useContext(AppContext);
  const { movies, searchQuery, genre } = state;

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
