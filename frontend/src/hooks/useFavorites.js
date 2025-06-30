import { useContext } from 'react';
import { AppContext } from '../contexts/AppReducerContext';
import { useNotification } from '../contexts/NotificationContext';

export const useFavorites = () => {
  const { state, dispatch } = useContext(AppContext);
  const { showSuccess, showError, showWarning } = useNotification();

  const addToFavorites = async (movie) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showWarning('Você precisa estar logado para adicionar favoritos!');
      return false;
    }

    // Verificar se já é favorito
    const isAlreadyFavorite = state.favorites.some(f => 
      f.id === movie.id || f.movie_tmdb_id === movie.id
    );

    if (isAlreadyFavorite) {
      showWarning('Este filme já está nos seus favoritos!');
      return false;
    }

    try {
      const response = await fetch('http://localhost:3001/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          movie_tmdb_id: movie.id,
          title: movie.title || movie.name,
          poster_url: movie.poster_path,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Erro desconhecido' };
        }
        
        if (response.status === 409) {
          // Filme já é favorito - sincronizar estado
          const currentlyFavorite = state.favorites.some(f => 
            f.id === movie.id || f.movie_tmdb_id === movie.id
          );
          if (!currentlyFavorite) {
            dispatch({ type: 'ADD_FAVORITE', payload: movie });
          }
          showWarning('Este filme já estava nos seus favoritos!');
          return true;
        }
        
        throw new Error(errorData.message || 'Falha ao salvar o favorito');
      }

      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: 'ADD_FAVORITE', payload: movie });
        showSuccess(`"${movie.title || movie.name}" foi adicionado aos favoritos!`);
        return true;
      } else {
        throw new Error(result.message || 'Falha ao salvar favorito');
      }

    } catch (error) {
      console.error('Erro em addToFavorites:', error);
      showError(`Não foi possível adicionar aos favoritos: ${error.message}`);
      return false;
    }
  };

  const removeFromFavorites = async (movieId, movieTitle) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showWarning('Você precisa estar logado para remover favoritos!');
      return false;
    }

    try {
      const response = await fetch(`http://localhost:3001/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao remover favorito';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Erro do servidor (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: 'REMOVE_FAVORITE', payload: movieId });
        showSuccess(`"${movieTitle || 'Filme'}" foi removido dos favoritos!`);
        return true;
      } else {
        throw new Error(result.message || 'Falha ao remover favorito');
      }

    } catch (error) {
      console.error('Erro em removeFromFavorites:', error);
      showError(`Não foi possível remover dos favoritos: ${error.message}`);
      return false;
    }
  };

  const isFavorite = (movieId) => {
    return state.favorites.some(f => 
      f.id === movieId || f.movie_tmdb_id === movieId
    );
  };

  const toggleFavorite = async (movie) => {
    const movieId = movie.id;
    const movieTitle = movie.title || movie.name;
    
    if (isFavorite(movieId)) {
      return await removeFromFavorites(movieId, movieTitle);
    } else {
      return await addToFavorites(movie);
    }
  };

  return {
    favorites: state.favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: state.favorites.length
  };
};

export default useFavorites;
