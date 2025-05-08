import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from 'react';
import { AppContext } from '../contexts/AppReducerContext';

export default function MovieCard({ item, compact = false }) {
  const { state, dispatch } = useContext(AppContext);
  const isFavorite = state.favorites.some((f) => f.id === item.id);

  const handleAddFavorite = () => {
    if (!isFavorite) {
      dispatch({ type: 'ADD_FAVORITE', payload: item });
    }
  };

  const handleRemoveFavorite = () => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: item.id });
  };

  const {
    title,
    name,
    poster_path,
    vote_average,
    release_date,
    first_air_date,
    media_type,
  } = item;

  const imageUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

  return (
    <Card
      sx={{
        maxWidth: compact ? 160 : 200,
        height: compact ? 320 : 460,
        margin: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        component="img"
        height={compact ? '200' : '300'}
        image={imageUrl}
        alt={title || name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 1,
        }}
      >
        <div>
          <Typography
            variant={compact ? 'subtitle2' : 'subtitle1'}
            fontWeight="bold"
            noWrap
          >
            {title || name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {media_type === 'movie' ? 'Filme' : 'Série'}
          </Typography>
          {!compact && (
            <>
              <Typography variant="body2">
                Lançamento: {release_date || first_air_date || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Nota: {vote_average || 'N/A'}
              </Typography>
            </>
          )}
        </div>
      </CardContent>

      {/* Botão de ação no canto superior direito */}
      <Tooltip
        title={
          compact
            ? 'Remover dos favoritos'
            : isFavorite
            ? 'Remover dos favoritos'
            : 'Adicionar aos favoritos'
        }
      >
        <IconButton
          onClick={compact ? handleRemoveFavorite : handleAddFavorite}
          sx={{
            position: 'absolute',
            top: 5,
            right: 5,
            color: 'error.main', // vermelho para ambos
          }}
        >
          {compact ? (
            <DeleteIcon />
          ) : isFavorite ? (
            <FavoriteIcon />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </Tooltip>
    </Card>
  );
}
