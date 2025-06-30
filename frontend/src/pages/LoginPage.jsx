import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleLogin = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        throw new Error(data.message || 'Token não encontrado na resposta');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" mb={2} textAlign="center">
          Login
        </Typography>
        <TextField
          fullWidth
          label="Usuário"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2" mt={1} textAlign="center">
            {error}
          </Typography>
        )}
        <Box mt={3} textAlign="center">
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Entrar
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Não tem uma conta?{' '}
            <RouterLink to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
              Crie uma agora
            </RouterLink>
          </Typography>
        </Box>
        
      </Paper>
    </Container>
  );
}