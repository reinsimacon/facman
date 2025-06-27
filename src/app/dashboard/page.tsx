'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Box, CircularProgress, Typography } from '@mui/material';

type Role = 'ADMIN' | 'USER' | 'MAINTENANCE';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { role: Role } = jwtDecode(token);
        const role = decoded.role;

        if (role === 'ADMIN') {
          router.replace('/dashboard/admin');
        } else if (role === 'USER') {
          router.replace('/dashboard/user');
        } else if (role === 'MAINTENANCE') {
          router.replace('/dashboard/maintenance');
        } else {
          // Fallback for any unknown role
          router.replace('/login');
        }
      } catch {
        // Token is invalid
        router.replace('/login');
      }
    } else {
      // No token found
      router.replace('/login');
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Redirecting to your dashboard...</Typography>
    </Box>
  );
}

 