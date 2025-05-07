import { useContext } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AppContext } from '../contexts/AppReducerContext';

const genreMap = [
  { label: 'Todos', movieId: 0, tvId: 0 },
  { label: 'Ação', movieId: 28, tvId: 10759 },
  { label: 'Aventura', movieId: 12, tvId: 10759 },
  { label: 'Animação', movieId: 16, tvId: 16 },
  { label: 'Comédia', movieId: 35, tvId: 35 },
  { label: 'Crime', movieId: 80, tvId: 80 },
  { label: 'Documentário', movieId: 99, tvId: 99 },
  { label: 'Drama', movieId: 18, tvId: 18 },
  { label: 'Família', movieId: 10751, tvId: 10751 },
  { label: 'Fantasia', movieId: 14, tvId: 10765 },
  { label: 'História', movieId: 36, tvId: 36 },
  { label: 'Terror', movieId: 27, tvId: 9648 },
  { label: 'Música', movieId: 10402, tvId: 10402 },
  { label: 'Mistério', movieId: 9648, tvId: 9648 },
  { label: 'Romance', movieId: 10749, tvId: 10749 },
  { label: 'Ficção Científica', movieId: 878, tvId: 10765 },
  { label: 'Cinema TV', movieId: 10770, tvId: 10770 },
  { label: 'Thriller', movieId: 53, tvId: 9648 },
  { label: 'Guerra', movieId: 10752, tvId: 10768 },
  { label: 'Faroeste', movieId: 37, tvId: 37 },
];

export default function GenreFilter() {
  const { state, dispatch } = useContext(AppContext);

  const handleChange = (e) => {
    const selectedGenre = genreMap.find((g) => g.label === e.target.value);
    dispatch({ type: 'SET_GENRE', payload: selectedGenre });
  };

  return (
    <FormControl
      fullWidth
      margin="normal"
      sx={{
        '& label': { color: '#ccc' },
        '& .MuiOutlinedInput-root': {
          color: '#fff',
          '& fieldset': {
            borderColor: '#888',
          },
          '&:hover fieldset': {
            borderColor: '#fff',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#42a5f5',
          },
          '& svg': {
            color: '#42a5f5',
          },
        },
      }}
    >
      <InputLabel>Gênero</InputLabel>
      <Select
        value={state.genre?.label || 'Todos'}
        label="Gênero"
        onChange={handleChange}
      >
        {genreMap.map((genre) => (
          <MenuItem key={genre.label} value={genre.label}>
            {genre.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
