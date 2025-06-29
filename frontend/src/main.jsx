import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { AppProvider } from './contexts/AppReducerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </React.StrictMode>,
);
