import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { AppProvider } from './contexts/AppReducerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AppProvider>
  </React.StrictMode>,
);
