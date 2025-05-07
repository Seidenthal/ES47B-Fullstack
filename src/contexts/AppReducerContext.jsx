// src/contexts/AppReducerContext.jsx
import { createContext } from 'react';

export const AppContext = createContext();

export const initialState = {
  movies: [],
  favorites: [],
  searchQuery: '',
  genre: '',
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
    default:
      return state;
  }
}
