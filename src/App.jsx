import { useReducer } from 'react';
import { Container, Box } from '@mui/material';
import SearchBar from './components/SearchBar';
import GenreFilter from './components/GenreFilter';
import MovieList from './components/MovieList';
import FavoritesToggleButton from './components/FavoriteToggleButton';
import FavoritesDrawer from './components/FavoritesDrawer';
import {
  AppContext,
  reducer,
  initialState,
} from './contexts/AppReducerContext';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
              </Box>
            </Box>
          </Box>

          {/* Lista de filmes/séries */}
          <MovieList />
        </Box>
      </Container>
      <FavoritesDrawer />
    </AppContext.Provider>
  );
}

export default App;
