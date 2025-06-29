import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
