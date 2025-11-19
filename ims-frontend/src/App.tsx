import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // 1. Import AuthProvider
import AppRouter from './router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider> {/* 2. Wrap everything in AuthProvider */}
        <Toaster 
          position="top-right"
          toastOptions={{
            // Default styles
            style: {
              background: 'var(--card-bg-default)',
              color: 'var(--font-color)',
              border: '1px solid var(--border-light-color)',
            },
            // Success styles (using your theme variables)
            success: { 
              style: { 
                background: 'var(--toast-success-bg)', 
                color: 'var(--toast-success-text)',
                border: '1px solid var(--toast-success-border)',
              },
              iconTheme: {
                primary: 'var(--toast-success-icon-color)',
                secondary: 'var(--card-bg-default)',
              }
            },
            // Error styles (using your theme variables)
            error: { 
              style: { 
                background: 'var(--toast-danger-bg)', 
                color: 'var(--toast-danger-text)',
                border: '1px solid var(--toast-danger-border)',
              },
              iconTheme: {
                primary: 'var(--toast-danger-icon-color)',
                secondary: 'var(--card-bg-default)',
              }
            },
          }}
        />
        
        {/* Use the router component */}
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;