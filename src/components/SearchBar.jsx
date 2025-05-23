import { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppReducerContext';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
  const { dispatch } = useContext(AppContext);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    dispatch({ type: 'SET_SEARCH', payload: inputValue.trim() });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <TextField
      label="Buscar por nome"
      variant="outlined"
      fullWidth
      margin="none"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      sx={{
        '& label': { color: '#ccc' }, // cor da label
        '& input': { color: '#fff' }, // cor do texto digitado
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#888', // borda normal
          },
          '&:hover fieldset': {
            borderColor: '#fff', // borda no hover
          },
          '&.Mui-focused fieldset': {
            borderColor: '#42a5f5', // borda quando focado
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleSearch} aria-label="search">
              <SearchIcon sx={{ color: '#42a5f5' }} /> {/* cor do ícone */}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
