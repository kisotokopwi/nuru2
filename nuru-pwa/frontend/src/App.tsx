import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h1>🚀 Nuru Company PWA</h1>
            <p>Foundation setup complete! Authentication system coming in next prompt.</p>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '20px', 
              borderRadius: '8px',
              maxWidth: '600px'
            }}>
              <h3>✅ Completed Foundation Components:</h3>
              <ul style={{ textAlign: 'left' }}>
                <li>Complete project structure</li>
                <li>Database schema with all business models</li>
                <li>Backend server with middleware</li>
                <li>PWA configuration</li>
                <li>Environment setup</li>
                <li>Package dependencies</li>
              </ul>
            </div>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;