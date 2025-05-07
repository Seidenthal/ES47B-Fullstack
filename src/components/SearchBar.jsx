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
      margin="normal"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleSearch} aria-label="search">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
