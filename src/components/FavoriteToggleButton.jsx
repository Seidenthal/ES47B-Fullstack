import { useContext } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppContext } from '../contexts/AppReducerContext';

export default function FavoritesToggleButton() {
  const { dispatch } = useContext(AppContext);

  return (
    <Box
      display="flex"
      alignItems="flex-end" // Alinha com a base do TextField
      height="100%"
      sx={{ mt: 1 }} // Ajuste fino para alinhar melhor
    >
      <Tooltip title="Favoritos">
        <IconButton
          onClick={() => dispatch({ type: 'TOGGLE_DRAWER' })}
          sx={{
            height: 56, // um pouco maior para compensar o TextField
            width: 56,
            border: '1px solid #888',
            borderRadius: 2,
            '&:hover': {
              borderColor: '#fff',
            },
          }}
        >
          <FavoriteIcon sx={{ color: '#42a5f5', fontSize: 32 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
