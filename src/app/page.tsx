"use client";
import { Button, Container, Typography, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h2" fontWeight={700} gutterBottom>
          Facility Management System
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Streamline facility issue reporting, announcements, and management for your organization.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button component={Link} href="/login" variant="contained" size="large">
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
