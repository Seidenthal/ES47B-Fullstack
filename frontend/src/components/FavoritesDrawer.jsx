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

  const handleRemove = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para remover favoritos!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao remover favorito do servidor.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta de erro:', parseError);
          errorMessage = `Erro do servidor (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse da resposta JSON
      const result = await response.json();
      
      if (result.success) {
        // Se a remoção no backend foi bem-sucedida, remove do estado local
        dispatch({ type: 'REMOVE_FAVORITE', payload: id });
        console.log('Favorito removido com sucesso!');
      } else {
        throw new Error(result.message || 'Falha ao remover favorito');
      }
    } catch (err) {
      console.error('Erro em handleRemove:', err);
      alert(`Não foi possível remover dos favoritos: ${err.message}`);
    }
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
      <Box
        sx={{
          width: '30vw',
          minWidth: 320,
          padding: 2,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
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
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))"
            gap={2}
          >
            {filtered.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                compact
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
