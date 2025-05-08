import { useReducer, useEffect } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = '';

        if (state.searchQuery) {
          url = `https://api.themoviedb.org/3/search/multi?api_key=afa87e0b93ec3b58cd0c858af4c4c399&query=${encodeURIComponent(
            state.searchQuery,
          )}&language=pt-BR`;
        } else {
          // Filmes/séries em alta quando a busca estiver vazia
          url = `https://api.themoviedb.org/3/trending/all/week?api_key=afa87e0b93ec3b58cd0c858af4c4c399&language=pt-BR`;
        }

        const res = await fetch(url);
        const data = await res.json();

        const filteredResults = data.results.filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv',
        );

        dispatch({ type: 'SET_MOVIES', payload: filteredResults });
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    fetchData();
  }, [state.searchQuery]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 4, px: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="stretch" gap={3}>
          {/* Filtros lado a lado */}
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Box flex={1}>
              <SearchBar />
            </Box>
            <Box flex={1}>
              <GenreFilter />
            </Box>
            <Box sx={{}}>
              <FavoritesToggleButton />
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
