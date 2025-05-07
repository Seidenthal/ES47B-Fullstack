import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppContext } from '../contexts/AppReducerContext';

export default function FavoritesToggleButton() {
  const { dispatch } = useContext(AppContext);

  return (
    <Tooltip title="Favoritos">
      <IconButton
        onClick={() => dispatch({ type: 'TOGGLE_DRAWER' })}
        sx={{ alignSelf: 'flex-start', ml: 'auto', mt: '8px' }}
      >
        <FavoriteIcon sx={{ color: '#42a5f5' }} />
      </IconButton>
    </Tooltip>
  );
}
