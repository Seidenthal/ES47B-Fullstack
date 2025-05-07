import { useReducer, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import SearchBar from './components/SearchBar';
import GenreFilter from './components/GenreFilter';
import MovieList from './components/MovieList';
// import FavoritesDrawer from './components/FavoritesDrawer';
import {
  AppContext,
  reducer,
  initialState,
} from './contexts/AppReducerContext';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState); // Inicializa o useReducer

  useEffect(() => {
    if (state.searchQuery) {
      const fetchData = async () => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=afa87e0b93ec3b58cd0c858af4c4c399&query=${encodeURIComponent(
              state.searchQuery,
            )}&language=pt-BR`,
          );
          const data = await res.json();

          // Ignora resultados do tipo "person"
          const filteredResults = data.results.filter(
            (item) => item.media_type === 'movie' || item.media_type === 'tv',
          );

          dispatch({ type: 'SET_MOVIES', payload: filteredResults });
        } catch (error) {
          console.error('Erro ao buscar dados da API:', error);
        }
      };

      fetchData();
    }
  }, [state.searchQuery]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flexGrow={1}>
            <SearchBar />
            <GenreFilter />
            <MovieList />
          </Box>

          {/* <FavoritesDrawer /> */}
        </Box>
      </Container>
    </AppContext.Provider>
  );
}

export default App;
