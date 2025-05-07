import { useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';

export default function MovieList() {
  const { state } = useContext(AppContext);
  const { movies, searchTerm, genre } = state;

  // Filtro por nome
  const nameFiltered = movies.filter((item) => {
    const title = item.title || item.name || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtro por gênero (respeitando se é filme ou série)
  const filteredResults = nameFiltered.filter((item) => {
    if (!genre || (genre.movieId === 0 && genre.tvId === 0)) return true;

    const genreIdToCheck =
      item.media_type === 'movie' ? genre.movieId : genre.tvId;
    return item.genre_ids?.includes(genreIdToCheck);
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
