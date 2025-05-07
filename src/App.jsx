import { useReducer } from 'react';
import { Container, Box } from '@mui/material';
import SearchBar from './components/SearchBar';
import GenreFilter from './components/GenreFilter';
import MovieList from './components/MovieList';
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
      <Container maxWidth="lg">
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
          <FavoritesDrawer />
        </Box>
      </Container>
    </AppContext.Provider>
  );
}

export default App;
