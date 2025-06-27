'use client';
import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Link as MuiLink,
  TablePagination,
} from '@mui/material';

interface Ticket {
  id: string;
  title: string;
  description: string;
  purpose: string;
  requestOfMaterials?: string;
  status: string;
  priority: string;
  impactLevel: string;
  denialReason?: string;
  facility: { name: string };
  user: { name: string };
  assignedTo?: { name: string };
  assignedToId?: string;
  createdAt: string;
  scheduledDate?: string;
  completionDate?: string;
  locationDetail?: string;
  requestedCompletionDate?: string;
  photoUrl?: string;
}

interface User {
  id: string;
  name: string;
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  DENIED: 'error',
  CLOSED: 'default',
};

const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error',
}

const impactLevelColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error',
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState<Partial<Ticket>>({});
  const [searchCategory, setSearchCategory] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [detailModalTicket, setDetailModalTicket] = useState<Ticket | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [ticketsRes, usersRes] = await Promise.all([
        fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users?role=MAINTENANCE', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const ticketsData = await ticketsRes.json();
      const usersData = await usersRes.json();
      setTickets(ticketsData.tickets || []);
      setUsers(usersData.users || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setForm({
      ...ticket,
      scheduledDate: ticket.scheduledDate ? new Date(ticket.scheduledDate).toISOString().substring(0, 16) : '',
      requestedCompletionDate: ticket.requestedCompletionDate ? new Date(ticket.requestedCompletionDate).toISOString().substring(0, 16) : '',
    });
  };

  const handleClose = () => {
    setEditingTicket(null);
    setForm({});
  };

  const handleChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if ('checked' in e.target) {
        const { checked } = e.target;
        setForm(prev => ({ ...prev, [name]: checked }));
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!editingTicket) return;

    const payload = {
      status: form.status,
      priority: form.priority,
      impactLevel: form.impactLevel,
      assignedToId: form.assignedToId,
      scheduledDate: form.scheduledDate,
      denialReason: form.status === 'DENIED' ? form.denialReason : null,
      completionDate: form.status === 'RESOLVED' ? new Date().toISOString() : null,
      locationDetail: form.locationDetail,
    };

    const res = await fetch('/api/tickets', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ticketId: editingTicket.id,
        ...payload,
      }),
    });

    const data = await res.json();
    if (res.ok) {
        setTickets(tickets => tickets.map(t => (t.id === data.id ? data : t)));
    } else {
        console.error('Failed to update ticket:', data);
    }
    handleClose();
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchValue) return true;

    if (searchCategory === 'createdAt') {
      const ticketDate = new Date(ticket.createdAt);
      const now = new Date();

      switch (searchValue) {
        case 'all':
          return true;
        case 'today': {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return ticketDate >= today;
        }
        case 'yesterday': {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return ticketDate >= yesterday && ticketDate < today;
        }
        case 'this_week': {
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          firstDayOfWeek.setHours(0, 0, 0, 0);
          return ticketDate >= firstDayOfWeek;
        }
        case 'this_month': {
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return ticketDate >= firstDayOfMonth;
        }
        case 'custom': {
          if (!customStartDate && !customEndDate) return true;
          const start = customStartDate ? new Date(customStartDate) : null;
          const end = customEndDate ? new Date(customEndDate) : null;
          if (start) start.setHours(0, 0, 0, 0);
          if (end) end.setHours(23, 59, 59, 999);
          if (start && end) return ticketDate >= start && ticketDate <= end;
          if (start) return ticketDate >= start;
          if (end) return ticketDate <= end;
          return true;
        }
        default:
          return true;
      }
    }

    const term = searchValue.toLowerCase();
    switch (searchCategory) {
      case 'title':
        return ticket.title.toLowerCase().includes(term);
      case 'priority':
        return ticket.priority.toLowerCase() === term;
      case 'impactLevel':
        return ticket.impactLevel.toLowerCase() === term;
      case 'status':
        return ticket.status.toLowerCase() === term;
      case 'user':
        return ticket.user.name.toLowerCase().includes(term);
      case 'assignedTo':
        return (ticket.assignedTo?.name || '').toLowerCase().includes(term);
      case 'facility':
        return ticket.facility.name.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderSearchValueInput = () => {
    if (searchCategory === 'createdAt') {
      return (
        <Box display="flex" gap={2} ml={2} flexGrow={1}>
          <FormControl fullWidth>
            <InputLabel>Range</InputLabel>
            <Select value={searchValue} label="Range" onChange={e => setSearchValue(e.target.value)}>
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {searchValue === 'custom' && (
            <>
              <TextField label="Start Date" type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </>
          )}
        </Box>
      );
    }
    const selectCategories = ['priority', 'impactLevel', 'status'];
    if (selectCategories.includes(searchCategory)) {
      const options = {
        priority: Object.keys(priorityColors),
        impactLevel: Object.keys(impactLevelColors),
        status: Object.keys(statusColors),
      }[searchCategory];

      return (
        <FormControl fullWidth sx={{ ml: 2 }}>
          <InputLabel>Value</InputLabel>
          <Select
            value={searchValue}
            label="Value"
            onChange={(e) => setSearchValue(e.target.value)}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {options?.map(opt => <MenuItem key={opt} value={opt.toLowerCase()}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
      );
    }
    return (
      <TextField
        label="Search Value"
        variant="outlined"
        fullWidth
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{ ml: 2 }}
      />
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage Tickets</Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchCategory}
            label="Search By"
            onChange={(e) => {
              setSearchCategory(e.target.value);
              setSearchValue('');
              setCustomStartDate('');
              setCustomEndDate('');
            }}
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="impactLevel">Impact</MenuItem>
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="user">Created By</MenuItem>
            <MenuItem value="assignedTo">Assigned To</MenuItem>
            <MenuItem value="facility">Facility</MenuItem>
            <MenuItem value="createdAt">Created At</MenuItem>
          </Select>
        </FormControl>
        {renderSearchValueInput()}
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Impact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} align="center">Loading...</TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={10} align="center">No tickets found.</TableCell></TableRow>
            ) : (
              paginatedTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <MuiLink component="button" underline="hover" color="primary" onClick={() => setDetailModalTicket(ticket)} sx={{ cursor: 'pointer', p: 0, background: 'none', border: 'none' }}>
                      {ticket.title}
                    </MuiLink>
                  </TableCell>
                  <TableCell><Chip label={ticket.priority} color={priorityColors[ticket.priority]} size="small" /></TableCell>
                  <TableCell><Chip label={ticket.impactLevel} color={impactLevelColors[ticket.impactLevel]} size="small" /></TableCell>
                  <TableCell><Chip label={ticket.status} color={statusColors[ticket.status]} size="small" /></TableCell>
                  <TableCell>{ticket.user.name}</TableCell>
                  <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                  <TableCell>{ticket.facility.name}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  <TableCell><Button variant="outlined" size="small" onClick={() => handleEdit(ticket)}>Edit</Button></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        component="div"
        count={filteredTickets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}
      />

      <Dialog open={!!editingTicket} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Ticket: {editingTicket?.title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={form.status || ''} name="status" label="Status" onChange={handleChange}>
              {Object.keys(statusColors).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          {form.status === 'DENIED' && (
            <TextField
              label="Denial Reason"
              name="denialReason"
              value={form.denialReason || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority || ''} name="priority" label="Priority" onChange={handleChange}>
                {Object.keys(priorityColors).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Impact Level</InputLabel>
            <Select value={form.impactLevel || ''} name="impactLevel" label="Impact Level" onChange={handleChange}>
                {Object.keys(impactLevelColors).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Assign To</InputLabel>
            <Select value={form.assignedToId || ''} name="assignedToId" label="Assign To" onChange={handleChange}>
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          
          <TextField
            label="Scheduled Date"
            name="scheduledDate"
            type="datetime-local"
            value={form.scheduledDate || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Location Detail"
            name="locationDetail"
            value={form.locationDetail || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!detailModalTicket} onClose={() => setDetailModalTicket(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Ticket Details: {detailModalTicket?.title}</DialogTitle>
        <DialogContent>
          {detailModalTicket && (
            <Box sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Ticket ID:</strong> {detailModalTicket.id}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                  <strong>Status:</strong>
                </Typography>
                <Chip label={detailModalTicket.status} color={statusColors[detailModalTicket.status]} size="small" />
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Facility:</strong> {detailModalTicket.facility.name}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Location:</strong> {detailModalTicket.locationDetail || '-'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                  <strong>Priority:</strong>
                </Typography>
                <Chip label={detailModalTicket.priority} color={priorityColors[detailModalTicket.priority]} size="small" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                  <strong>Impact:</strong>
                </Typography>
                <Chip label={detailModalTicket.impactLevel} color={impactLevelColors[detailModalTicket.impactLevel]} size="small" />
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Description:</strong> {detailModalTicket.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Purpose:</strong> {detailModalTicket.purpose}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Assigned To:</strong> {detailModalTicket.assignedTo?.name || 'Unassigned'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Requested Completion:</strong>{' '}
                {detailModalTicket.requestedCompletionDate
                  ? new Date(detailModalTicket.requestedCompletionDate).toLocaleDateString()
                  : '-'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Materials Request:</strong> {detailModalTicket.requestOfMaterials || '-'}
              </Typography>
              {detailModalTicket.photoUrl && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Attachment:</strong> <MuiLink href={detailModalTicket.photoUrl} target="_blank" rel="noopener noreferrer">View Image</MuiLink>
                </Typography>
              )}
              {detailModalTicket.denialReason && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Denial Reason:</strong> {detailModalTicket.denialReason}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mt: 2 }}>
                <em>Created by {detailModalTicket.user?.name || 'N/A'} on {new Date(detailModalTicket.createdAt).toLocaleString()}</em>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalTicket(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 