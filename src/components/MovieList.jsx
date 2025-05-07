import { useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';

export default function MovieList() {
  const { state } = useContext(AppContext);
  const { movies, searchQuery, genre } = state;

  // Se searchQuery estiver vazio, mantemos todos os filmes
  const nameFiltered =
    searchQuery.trim() === ''
      ? movies
      : movies.filter((item) => {
          const title = item.title || item.name || '';
          return title.toLowerCase().includes(searchQuery.toLowerCase());
        });

  // Filtro por gênero (respeitando se é filme ou série)
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
    <Grid container spacing={2}>
      {filteredResults.map((item) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={`${item.id}-${item.media_type}`}
        >
          <MovieCard item={item} />
        </Grid>
      ))}
    </Grid>
  );
}
