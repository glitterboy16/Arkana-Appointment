import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0D1347',
            color: '#FAFAFA',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 13,
            fontFamily: "'SF Pro Display','Inter',sans-serif",
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#0D1347' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0D1347' } },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);
