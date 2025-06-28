// src/contexts/AppReducerContext.jsx
import React, { createContext, useReducer } from 'react';

export const AppContext = createContext();

export const initialState = {
  movies: [],
  favorites: [],
  searchQuery: '',
  genre: { movieId: 0, tvId: 0 },
  favoritesSearch: '',
  drawerOpen: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_MOVIES':
      return { ...state, movies: action.payload };
    case 'ADD_FAVORITE':
      return { ...state, favorites: [...state.favorites, action.payload] };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter((f) => f.id !== action.payload),
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_GENRE':
      return { ...state, genre: action.payload };
    case 'TOGGLE_DRAWER':
      return { ...state, drawerOpen: !state.drawerOpen };
    case 'SET_FAVORITES_SEARCH':
      return { ...state, favoritesSearch: action.payload };
    case 'ADD_MOVIES':
      const existingKeys = new Set(
        state.movies.map((item) => `${item.id}-${item.media_type}`)
      );

      const newUniqueMovies = action.payload.filter(
        (item) => !existingKeys.has(`${item.id}-${item.media_type}`)
      );

      return {
        ...state,
        movies: [...state.movies, ...newUniqueMovies],
      };
    default:
      return state;
  }

}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}