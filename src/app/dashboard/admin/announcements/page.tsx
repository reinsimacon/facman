"use client";
import { Typography, Box, Button, Modal, TextField, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useState, useEffect } from 'react';

export default function AdminAnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setError(null); setSuccess(null); setForm({ title: '', content: '' }); };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to add announcement');
        return;
      }
      setSuccess('Announcement added!');
      setForm({ title: '', content: '' });
    } catch {
      setError('Unexpected error');
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
      setLoading(false);
    };
    fetchAnnouncements();
  }, [success]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Announcements
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpen}>Add Announcement</Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="h6" mb={2}>Add Announcement</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Content" name="content" value={form.content} onChange={handleChange} fullWidth margin="normal" multiline rows={4} required />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            {success && <Typography color="primary" variant="body2">{success}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>Add</Button>
          </form>
        </Box>
      </Modal>
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