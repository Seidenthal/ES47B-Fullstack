import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
} from '@mui/material';
import { FavoriteBorder } from '@mui/icons-material';

export default function MovieCard({ item }) {
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
        maxWidth: 200,
        height: 460,
        margin: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        component="img"
        height="300"
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
        }}
      >
        <div>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {title || name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {media_type === 'movie' ? 'Filme' : 'Série'}
          </Typography>
          <Typography variant="body2">
            Lançamento: {release_date || first_air_date || 'N/A'}
          </Typography>
          <Typography variant="body2">Nota: {vote_average || 'N/A'}</Typography>
        </div>
      </CardContent>
      <IconButton
        sx={{ position: 'absolute', top: 5, right: 5 }}
        aria-label="favoritar"
      >
        <FavoriteBorder />
      </IconButton>
    </Card>
  );
}
