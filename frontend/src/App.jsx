import { useReducer } from 'react';
import { Container, Box, IconButton, Tooltip } from '@mui/material';
import SearchBar from './components/SearchBar';
import GenreFilter from './components/GenreFilter';
import MovieList from './components/MovieList';
import FavoritesToggleButton from './components/FavoriteToggleButton';
import FavoritesDrawer from './components/FavoritesDrawer';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import { AppContext} from './contexts/AppReducerContext';
import { useContext,useEffect } from 'react';

function App() {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFavorites = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const favoriteMovies = await response.json();
            dispatch({ type: 'SET_FAVORITES', payload: favoriteMovies });
          } else {
            // Se o token for inválido, limpe o localStorage
            localStorage.removeItem('token');
            dispatch({ type: 'SET_FAVORITES', payload: [] });
          }
        } catch (error) {
          console.error('Erro ao buscar favoritos:', error);
          dispatch({ type: 'SET_FAVORITES', payload: [] });
        }
      } else {
        // Usuário não logado, limpa favoritos
        dispatch({ type: 'SET_FAVORITES', payload: [] });
      }
    };
    fetchUserFavorites();
  }, [dispatch]);

  return (
    // Adicionado um Fragment <> para agrupar os elementos irmãos
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
                      border: '2px solid #42a5f5',
                      borderRadius: 2,
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 28, color: '#42a5f5' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Lista de filmes/séries */}
          <MovieList />
        </Box>
      </Container>
      <FavoritesDrawer />
    </>
  );
}

export default App;
