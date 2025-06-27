"use client";
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Card, CardContent, Badge, Avatar, Chip, Select, MenuItem, FormControl, InputLabel, TablePagination, Modal, IconButton } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CampaignIcon from '@mui/icons-material/Campaign';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Button } from '@mui/material';

interface Facility {
  id: string;
  name: string;
  location?: string;
  type?: string;
  floorOrZone?: string;
  areaSqm?: number | null;
  maintenanceFrequency?: string;
  lastInspectionDate?: string;
  nextPlannedPMDate?: string;
  remarks?: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  DENIED: 'Denied',
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#8884d8',
  IN_PROGRESS: '#00bcd4',
  RESOLVED: '#4caf50',
  DENIED: '#f44336',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function UserDashboardPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [searchCategory, setSearchCategory] = useState('name');
  const [detailFacility, setDetailFacility] = useState<Facility | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch user name from JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserName(payload.name || '');
    } catch {}
  }, []);

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

  // Fetch Tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setTicketLoading(true);
      const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setTickets(data.tickets || []);
      setTicketLoading(false);
    };
    fetchTickets();
  }, []);

  // Facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      const res = await fetch('/api/facilities');
      const data = await res.json();
      setFacilities(data.facilities || []);
      setLoading(false);
    };
    fetchFacilities();
  }, []);

  // Ticket status chart data
  const chartData = useMemo(() => {
    const data = {
      OPEN: tickets.filter(t => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
      DENIED: tickets.filter(t => t.status === 'DENIED').length,
    };
    return [
      { name: STATUS_LABELS.OPEN, value: data.OPEN },
      { name: STATUS_LABELS.IN_PROGRESS, value: data.IN_PROGRESS },
      { name: STATUS_LABELS.RESOLVED, value: data.RESOLVED },
      { name: STATUS_LABELS.DENIED, value: data.DENIED },
    ];
  }, [tickets]);

  const filteredFacilities = facilities.filter(f => {
    if (!search) return true;
    const term = search.toLowerCase();
    const value = f[searchCategory as keyof Facility];
    return String(value || '').toLowerCase().includes(term);
  });
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedFacilities = filteredFacilities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Welcome Message */}
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#fff' }}>
        {getGreeting()}{userName ? `, ${userName}` : ''}!
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }} gutterBottom>
        Welcome to your dashboard. You can create tickets, view announcements, and track your ticket status from the sidebar.
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

      {/* Ticket Status Chart */}
      <Box sx={{ mb: 4, width: '100%', maxWidth: 400, height: 250 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>My Ticket Statuses</Typography>
        {ticketLoading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
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
        )}
      </Box>

      {/* Facilities Table (admin-like) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Facilities</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchCategory}
              label="Search By"
              onChange={e => setSearchCategory(e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="type">Type</MenuItem>
              <MenuItem value="floorOrZone">Floor/Zone</MenuItem>
              <MenuItem value="location">Location</MenuItem>
            </Select>
          </FormControl>
          <TextField label={`Search ${searchCategory.charAt(0).toUpperCase() + searchCategory.slice(1)}`} variant="outlined" size="small" fullWidth value={search} onChange={e => setSearch(e.target.value)} />
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Floor/Zone</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Next PM Date</TableCell>
                <TableCell>Last Inspection Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : paginatedFacilities.length === 0 ? (
                <TableRow><TableCell colSpan={7}>No facilities found.</TableCell></TableRow>
              ) : (
                paginatedFacilities.map(facility => (
                  <TableRow key={facility.id}>
                    <TableCell>{facility.name}</TableCell>
                    <TableCell>{facility.type || '-'}</TableCell>
                    <TableCell>{facility.floorOrZone || '-'}</TableCell>
                    <TableCell>{facility.location || '-'}</TableCell>
                    <TableCell>{facility.nextPlannedPMDate ? new Date(facility.nextPlannedPMDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{facility.lastInspectionDate ? new Date(facility.lastInspectionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => setDetailFacility(facility)}><VisibilityOutlinedIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 20, 30, 40, 50]}
            component="div"
            count={filteredFacilities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}
          />
        </TableContainer>
        <Modal open={!!detailFacility} onClose={() => setDetailFacility(null)} sx={{ overflowY: 'auto' }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, width: { xs: '90%', sm: 500 } }}>
            {detailFacility && (
              <>
                <Typography variant="h6" mb={2}>Facility Details: {detailFacility.name}</Typography>
                <Typography variant="body1"><strong>Type:</strong> {detailFacility.type}</Typography>
                <Typography variant="body1"><strong>Location:</strong> {detailFacility.location}</Typography>
                <Typography variant="body1"><strong>Floor/Zone:</strong> {detailFacility.floorOrZone}</Typography>
                <Typography variant="body1"><strong>Area (sqm):</strong> {detailFacility.areaSqm ?? '-'}</Typography>
                <Typography variant="body1"><strong>Maintenance Frequency:</strong> {detailFacility.maintenanceFrequency}</Typography>
                <Typography variant="body1"><strong>Last Inspection Date:</strong> {detailFacility.lastInspectionDate ? new Date(detailFacility.lastInspectionDate).toLocaleDateString() : '-'}</Typography>
                <Typography variant="body1"><strong>Next Planned PM Date:</strong> {detailFacility.nextPlannedPMDate ? new Date(detailFacility.nextPlannedPMDate).toLocaleDateString() : '-'}</Typography>
                <Typography variant="body1"><strong>Remarks:</strong> {detailFacility.remarks || '-'}</Typography>
                <Button onClick={() => setDetailFacility(null)} sx={{ mt: 3 }}>Close</Button>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
} 