import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  Box,
  Modal,
  Button,
} from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from '../contexts/AppReducerContext';


function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function MovieCard({ item, compact = false }) {
  const { state, dispatch } = useContext(AppContext);
  // Verifica se é favorito comparando o TMDB ID
  const isFavorite = state.favorites.some((f) => 
    f.id === item.id || f.movie_tmdb_id === item.id
  );

  const [open, setOpen] = useState(false);
  const [modalBgColor, setModalBgColor] = useState('');
  const [overview, setOverview] = useState('');
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);


  const handleOpen = () => {
    const colors = ['lightcyan', 'mediumslateblue', 'powderblue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setModalBgColor(randomColor);
    setOpen(true);
    fetchMovieDetails();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddFavorite = async () => {
    // 1. Pega o token para verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para adicionar favoritos!');
      // Idealmente, você pode redirecionar para a página de login aqui
      // import { useNavigate } from 'react-router-dom';
      // const navigate = useNavigate();
      // navigate('/login');
      return;
    }

    // 2. Verifica se o filme já não é um favorito antes de fazer a chamada
    const isAlreadyFavorite = state.favorites.some((f) => 
      f.id === item.id || f.movie_tmdb_id === item.id
    );
    
    if (isAlreadyFavorite) {
      console.log('Este filme já está nos favoritos.');
      alert('Este filme já está nos seus favoritos!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          movie_tmdb_id: item.id,
          title: item.title || item.name,
          poster_url: item.poster_path,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Filme já é favorito - atualiza o estado local se necessário
          console.log('Filme já é favorito, sincronizando estado...');
          const currentlyFavorite = state.favorites.some((f) => 
            f.id === item.id || f.movie_tmdb_id === item.id
          );
          if (!currentlyFavorite) {
            dispatch({ type: 'ADD_FAVORITE', payload: item });
          }
          return;
        }
        throw new Error(errorData.message || 'Falha ao salvar o favorito no servidor.');
      }

      // 4. Se a chamada ao backend for bem-sucedida, atualiza o estado local
      console.log('Filme salvo no backend com sucesso!');
      dispatch({ type: 'ADD_FAVORITE', payload: item });

    } catch (err) {
      console.error('Erro em handleAddFavorite:', err);
      alert(`Não foi possível adicionar aos favoritos: ${err.message}`);
    }
  };

  const handleRemoveFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para remover favoritos!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/favorites/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao remover favorito do servidor.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta de erro:', parseError);
          errorMessage = `Erro do servidor (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Se a remoção no backend foi bem-sucedida, remove do estado local
      dispatch({ type: 'REMOVE_FAVORITE', payload: item.id });
      console.log('Favorito removido com sucesso!');
    } catch (err) {
      console.error('Erro em handleRemoveFavorite:', err);
      alert(`Não foi possível remover dos favoritos: ${err.message}`);
    }
  };

  const {
    title,
    name,
    poster_path,
    poster_url,
    vote_average,
    release_date,
    first_air_date,
    media_type,
  } = item;

  const fetchMovieDetails = async () => {
    try {
      const apiKey = 'afa87e0b93ec3b58cd0c858af4c4c399';

      const detailsUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${apiKey}&language=pt-BR`;
      const creditsUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}/credits?api_key=${apiKey}&language=pt-BR`;

      const detailsRes = await fetch(detailsUrl);
      const creditsRes = await fetch(creditsUrl);

      const dataDetails = await detailsRes.json();
      const dataCredits = await creditsRes.json();

      setOverview(dataDetails.overview);
      setCredits(dataCredits);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setOverview('');
      setCredits(null);
    }
  };

  useEffect(() => {
    if (open) {
      const fetchDetails = async () => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=afa87e0b93ec3b58cd0c858af4c4c399&language=pt-BR`
          );
          const data = await res.json();

          if (!data || !data.overview) {
            console.warn('Detalhes incompletos ou ausência de overview:', data);
          }

          setDetails({
            title: data.title || data.name || 'Título não disponível',
            overview: data.overview || 'Sinopse indisponível no momento.',
            genres: data.genres?.map((g) => g.name).join(', ') || 'Gêneros não informados',
            releaseDate: data.release_date || data.first_air_date || 'Data não disponível',
          });
        } catch (err) {
          console.error('Erro ao buscar detalhes:', err);
        }
      };


      fetchDetails();
    }
  }, [open, item.id, media_type]);

  const imagePath = poster_path || poster_url;

  const imageUrl = imagePath
    ? `https://image.tmdb.org/t/p/w500${imagePath}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';
  // cores: lightcyan, mediumslateblue, powderblue
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
        <Modal
          open={open}
          onClose={handleClose}
          sx={{
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 800,
              bgcolor: modalBgColor,
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: 'flex',
              gap: 4,
              maxHeight: '90vh',
              overflow: 'hidden',
              color: '#000',
            }}
          >
            {/* Lado esquerdo (poster) */}
            <Box
              sx={{
                flex: '0 0 40%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={imageUrl}
                alt={title || name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                }}
              />
            </Box>

            <Box
              sx={{
                flex: '1 1 60%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxHeight: '100%',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  overflowY: 'auto',
                  pr: 1,
                  flexGrow: 1,
                }}
              >
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  {title || name}
                </Typography>

                <Typography variant="body1" mb={1}>
                  <strong>Diretor(es):</strong>{' '}
                  {credits?.crew
                    ?.filter((p) => p.job === 'Director')
                    .map((p) => p.name)
                    .join(', ') || 'Não disponível'}
                </Typography>

                <Typography variant="body1" mb={1}>
                  <strong>Elenco principal:</strong>{' '}
                  {credits?.cast
                    ?.slice(0, 5)
                    .map((p) => p.name)
                    .join(', ') || 'Não disponível'}
                </Typography>

                <Typography variant="h6" mt={2}>
                  Sinopse
                </Typography>
                <Typography variant="body2" mb={3}>
                  {overview || 'Sinopse não disponível.'}
                </Typography>
              </Box>

              {/* Botão fixado embaixo */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  sx={{ width: '100%' }}
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  Fechar
                </Button>
              </Box>
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
                      position: 'relative',
                      background: '#fff', // Cor de fundo padrão
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: vote_average
                          ? `conic-gradient(${vote_average > 7
                            ? 'green'
                            : vote_average >= 5
                              ? 'goldenrod'
                              : 'red'
                          } ${vote_average * 10}%, transparent ${vote_average * 10
                          }%)`
                          : 'transparent',
                        mask: 'radial-gradient(circle, transparent 60%, black 61%)',
                        WebkitMask:
                          'radial-gradient(circle, transparent 60%, black 61%)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ position: 'relative' }}
                    >
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
            onClick={(e) => {
              e.stopPropagation();
              if (compact) {
                handleRemoveFavorite();
              } else if (isFavorite) {
                handleRemoveFavorite();
              } else {
                handleAddFavorite();
              }
            }}
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
