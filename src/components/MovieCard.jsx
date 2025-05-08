import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  Box,
  Modal,
  Button
} from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from '../contexts/AppReducerContext';
import axios from 'axios';


function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function MovieCard({ item, compact = false }) {
  const { state, dispatch } = useContext(AppContext);
  const isFavorite = state.favorites.some((f) => f.id === item.id);

  //janelinha de informações do filme
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    fetchMovieDetails();
  };
  const handleClose = ()=> {
    setOpen(false);
  };
  const [details, setOverview] = useState('');
  const [credits, setCredits] = useState(null);


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
    overview
  } = item;

  useEffect(() => {
    if (open) {
      const fetchDetails = async () => {
        try {
          const type = media_type === 'movie' ? 'movie' : 'tv';
          const response = await axios.get(
            `https://api.themoviedb.org/3/${type}/${item.id}?api_key=YOUR_API_KEY&append_to_response=credits&language=pt-BR`
          );
          setDetails(response.data);
        } catch (error) {
          console.error('Erro ao buscar detalhes:', error);
        }
      };

      fetchDetails();
    }
  }, [open, item.id, media_type]);

  const fetchMovieDetails = async () => {
    try {
      const apiKey = 'afa87e0b93ec3b58cd0c858af4c4c399';
  
      const detailsUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${apiKey}&language=pt-BR`;
      const creditsUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}/credits?api_key=${apiKey}&language=pt-BR`;
  
      const [detailsRes, creditsRes] = await Promise.all([
        axios.get(detailsUrl),
        axios.get(creditsUrl),
      ]);
  
      setOverview(detailsRes.data.overview);
      setCredits(creditsRes.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setOverview('');
      setCredits(null);
    }
  };

  const imageUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

  return (
    <Box onClick={handleOpen} sx={{ cursor: 'pointer' }}>
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
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 800,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: 'flex',
              gap: 4,
            }}
          >
            {/* Lado Esquerdo - Poster */}
            <Box sx={{ flex: '1 1 40%' }}>
              <img
                src={imageUrl}
                alt={title || name}
                style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }}
              />
            </Box>

            {/* Lado Direito - Informações */}
            <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                {title || name}
              </Typography>

              <Typography variant="body1" mb={1}>
                <strong>Diretor(es):</strong> {credits?.crew?.filter(p => p.job === 'Director').map(p => p.name).join(', ') || 'Não disponível'}
              </Typography>

              <Typography variant="body1" mb={1}>
                <strong>Elenco principal:</strong> {credits?.cast?.slice(0, 5).map(p => p.name).join(', ') || 'Não disponível'}
              </Typography>

              <Typography variant="h6" mt={2}>
                Sinopse
              </Typography>
              <Typography variant="body2" mb={3}>
                {overview || 'Sinopse não disponível.'}
              </Typography>

              <Button onClick={handleClose} variant="contained">
                Fechar
              </Button>
            </Box>
          </Box>
        </Modal>
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
          <div style={{ textAlign: 'center' }}>
            <Tooltip title={title || name} arrow>
              <Typography
                variant={compact ? 'subtitle2' : 'subtitle1'}
                fontWeight="bold"
                noWrap
              >
                {title || name}
              </Typography>
            </Tooltip>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', marginTop: 0.5 }}
            >
              {media_type === 'movie' ? 'Filme' : 'Série'}
            </Typography>

            {!compact && (
              <>
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  Lançamento: {formatDate(release_date || first_air_date)}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'gold',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {vote_average ? Number(vote_average).toFixed(1) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
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
              color: 'error.main',
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
    </Box>
  );
}
