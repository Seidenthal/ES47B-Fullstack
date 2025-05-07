import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppReducerContext';
import MovieCard from './MovieCard';

export default function FavoritesDrawer() {
  const { state, dispatch } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
  };

  const filtered = state.favorites.filter((fav) =>
    (fav.title || fav.name)
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  return (
    <Drawer
      anchor="right"
      open={state.drawerOpen}
      onClose={() => dispatch({ type: 'TOGGLE_DRAWER' })}
    >
      <Box sx={{ width: 320, padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Favoritos</Typography>
          <IconButton onClick={() => dispatch({ type: 'TOGGLE_DRAWER' })}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          label="Buscar nos favoritos"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {filtered.length === 0 ? (
          <Typography variant="body2">Nenhum favorito encontrado.</Typography>
        ) : (
          filtered.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              compact
              onRemove={() => handleRemove(item.id)}
            />
          ))
        )}
      </Box>
    </Drawer>
  );
}
