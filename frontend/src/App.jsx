import { useReducer } from 'react';
import { Container, Box, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import SearchBar from './components/SearchBar';
import GenreFilter from './components/GenreFilter';
import MovieList from './components/MovieList';
import FavoritesToggleButton from './components/FavoriteToggleButton';
import FavoritesDrawer from './components/FavoritesDrawer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useNavigate } from 'react-router-dom';
import { AppContext} from './contexts/AppReducerContext';
import { useContext, useEffect, useState } from 'react';

function App() {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchUserFavorites = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:3001/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const result = await response.json();
            const favoriteMovies = result.data || result;
            dispatch({ type: 'SET_FAVORITES', payload: favoriteMovies });
          } else {
            // Se o token for inválido, limpe o localStorage
            localStorage.removeItem('token');
            dispatch({ type: 'SET_FAVORITES', payload: [] });
            setNotification({
              open: true,
              message: 'Sessão expirada. Faça login novamente.',
              severity: 'warning'
            });
          }
        } catch (error) {
          console.error('Erro ao buscar favoritos:', error);
          dispatch({ type: 'SET_FAVORITES', payload: [] });
          setNotification({
            open: true,
            message: 'Erro ao carregar favoritos. Verifique sua conexão.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Usuário não logado, limpa favoritos
        dispatch({ type: 'SET_FAVORITES', payload: [] });
      }
    };
    fetchUserFavorites();
  }, [dispatch]);

  return (
    <>
      <Container maxWidth={false} disableGutters sx={{ mt: '120px', px: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="stretch" gap={3}>
          <Box
            component="header"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 1100,
              bgcolor: '#121212',
              boxShadow: 3,
              px: 2,
              py: 2,
            }}
          >
            <Box maxWidth="lg" mx="auto">
              <Box display="flex" gap={1} alignItems="flex-end" flexWrap="wrap">
                <Box flex={1}>
                  <SearchBar />
                </Box>
                <Box flex={1}>
                  <GenreFilter />
                </Box>
                <FavoritesToggleButton />
                <Tooltip title="Login">
                  <IconButton
                    onClick={() => navigate('/login')}
                    sx={{
                      height: 56,
                      width: 56,
                      border: '1px solid #888',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#fff',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      },
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 28, color: '#42a5f5' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Indicador de carregamento */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <CircularProgress size={60} />
            </Box>
          ) : (
            /* Lista de filmes/séries */
            <MovieList />
          )}
        </Box>
      </Container>
      <FavoritesDrawer />
      
      {/* Notificações */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
