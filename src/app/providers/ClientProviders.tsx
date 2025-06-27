"use client";
import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import emotionCache from './emotionCache';

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#fff' },
      secondary: { main: '#9c27b0' },
      background: { default: '#18191A', paper: '#232526' },
      text: { primary: '#fff', secondary: '#b0b3b8' },
    },
    typography: {
      fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
      fontWeightBold: 700,
    },
  });
  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
} 