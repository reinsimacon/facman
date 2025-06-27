"use client";
import { Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function UserAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Announcements
      </Typography>
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : announcements.length === 0 ? (
          <Typography color="text.secondary">No announcements found.</Typography>
        ) : (
          <List>
            {announcements.map(a => (
              <ListItem key={a.id} alignItems="flex-start" component={Paper} sx={{ mb: 2, p: 2 }}>
                <ListItemText
                  primary={<Typography variant="h6">{a.title}</Typography>}
                  secondary={<>
                    <Typography variant="body2" color="text.secondary" component="span">{a.content}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>{new Date(a.createdAt).toLocaleString()}</Typography>
                  </>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
} 