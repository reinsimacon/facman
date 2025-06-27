"use client";

import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Card, CardContent, Avatar, Badge, Chip } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CampaignIcon from '@mui/icons-material/Campaign';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

interface Ticket {
  id: string;
  title: string;
  user: { name: string };
  facility: { name: string };
  status: string;
  createdAt: string;
  assignedTo?: { name: string };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Unread',
  IN_PROGRESS: 'Ongoing',
  RESOLVED: 'Done',
  DENIED: 'Denied',
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#8884d8',
  IN_PROGRESS: '#00bcd4',
  RESOLVED: '#4caf50',
  DENIED: '#f44336',
};

// Helper to decode JWT and extract payload
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function MaintenanceDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const res = await fetch('/api/tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      // Only tickets assigned to this maintenance user
      const token = localStorage.getItem('token');
      let currentUserName = '';
      if (token) {
        const decoded = decodeJWT(token);
        // Try username, name, or email (adjust as per your JWT payload)
        currentUserName = decoded?.name || decoded?.username || decoded?.email || '';
      }
      setTickets((data.tickets || []).filter((t: Ticket) => t.assignedTo?.name === currentUserName));
      setLoading(false);
    };
    fetchTickets();
  }, []);

  const chartData = useMemo(() => {
    const data = {
      OPEN: tickets.filter(t => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
      DENIED: tickets.filter(t => t.status === 'DENIED').length,
    };
    return [
      { name: 'Unread', value: data.OPEN },
      { name: 'Ongoing', value: data.IN_PROGRESS },
      { name: 'Done', value: data.RESOLVED },
      { name: 'Denied', value: data.DENIED },
    ];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (!search) return tickets;
    const searchTerm = search.toLowerCase();
    return tickets.filter(ticket =>
      (ticket.user.name?.toLowerCase() || '').includes(searchTerm) ||
      (ticket.title?.toLowerCase() || '').includes(searchTerm) ||
      (ticket.assignedTo?.name?.toLowerCase() || '').includes(searchTerm)
    );
  }, [tickets, search]);

  // Group tickets by status
  const grouped = useMemo(() => ({
    OPEN: filteredTickets.filter(t => t.status === 'OPEN'),
    IN_PROGRESS: filteredTickets.filter(t => t.status === 'IN_PROGRESS'),
    RESOLVED: filteredTickets.filter(t => t.status === 'RESOLVED'),
    DENIED: filteredTickets.filter(t => t.status === 'DENIED'),
  }), [filteredTickets]);

  // Fetch Announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setAnnLoading(true);
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
      setAnnLoading(false);
    };
    fetchAnnouncements();
  }, []);

  // Track unread announcements in localStorage
  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
    const latestIds = (announcements.slice(0, 3) || []).map(a => a.id);
    setUnreadIds(latestIds.filter(id => !readIds.includes(id)));
  }, [announcements]);

  // Mark announcements as read when user views them
  const markAnnouncementsRead = () => {
    const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
    const latestIds = (announcements.slice(0, 3) || []).map(a => a.id);
    const updated = Array.from(new Set([...readIds, ...latestIds]));
    localStorage.setItem('readAnnouncements', JSON.stringify(updated));
    setUnreadIds([]);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#fff' }}>
        Maintenance Dashboard
      </Typography>
      {/* Contact Info */}
      <Card sx={{ mb: 3, maxWidth: 400, background: '#232526', color: '#fff' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}><ContactPhoneIcon /></Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>FacMan Admin: Rein Ryan Simacon</Typography>
            <Typography variant="body2">Email: admin@facman.com</Typography>
            <Typography variant="body2">Phone: 09842555107</Typography>
            <Typography variant="body2">Telephone: 203-204</Typography>
          </Box>
        </CardContent>
      </Card>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }} gutterBottom>
        Welcome! Here is a summary of your assigned tickets.
      </Typography>
      <Box sx={{ mt: 4, mb: 4, width: '100%', maxWidth: 500, height: 300 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Ticket Status Distribution</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={Object.values(STATUS_COLORS)[idx]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <TextField
        label="Search Tickets"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
      />

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <>
          {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DENIED'] as const).map(status => (
            <Box key={status} sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {STATUS_LABELS[status]} Tickets
              </Typography>
              {grouped[status].length === 0 ? (
                <Typography color="text.secondary">No tickets found.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '25%' }}>Title</TableCell>
                        <TableCell sx={{ width: '25%' }}>User</TableCell>
                        <TableCell sx={{ width: '25%' }}>Created At</TableCell>
                        <TableCell sx={{ width: '25%' }}>Assigned To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grouped[status].map(ticket => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>{ticket.user?.name || '-'}</TableCell>
                          <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ))}
        </>
      )}

      <Box sx={{ mt: 6 }}>
        {/* Announcements */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CampaignIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>Latest Announcements</Typography>
            <Badge color="error" badgeContent={unreadIds.length} invisible={unreadIds.length === 0} sx={{ cursor: 'pointer' }}>
              <Chip label="Unread" color="error" size="small" onClick={markAnnouncementsRead} />
            </Badge>
          </Box>
          {annLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : announcements.length === 0 ? (
            <Typography color="text.secondary">No announcements found.</Typography>
          ) : (
            <Box>
              {announcements.slice(0, 3).map(a => (
                <Card key={a.id} sx={{ mb: 1, background: unreadIds.includes(a.id) ? '#2e3b55' : '#232526', color: '#fff' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>{a.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{a.content}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(a.createdAt).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
} 