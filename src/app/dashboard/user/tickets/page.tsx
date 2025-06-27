'use client';
import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  IconButton,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import Link from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Ticket {
  id: string;
  title: string;
  description: string;
  purpose: string;
  requestOfMaterials?: string;
  status: string;
  priority: string;
  denialReason?: string;
  facility: { name: string };
  assignedTo?: { name: string };
  createdAt: string;
  impactLevel: string;
  locationDetail?: string;
  requestedCompletionDate?: string;
  photoUrl?: string;
  user: { name: string; email: string };
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  OPEN: 'default',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
  DENIED: 'error',
  URGENT: 'error',
};

const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
};

const impactLevelColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error',
};

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCategory, setSearchCategory] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleOpenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchValue) return true;
    const term = searchValue.toLowerCase();
    switch (searchCategory) {
      case 'title':
        return ticket.title.toLowerCase().includes(term);
      case 'facility':
        return ticket.facility.name.toLowerCase().includes(term);
      case 'priority':
        return ticket.priority.toLowerCase() === term;
      case 'status':
        return ticket.status.toLowerCase() === term;
      case 'impact':
        return ticket.impactLevel?.toLowerCase() === term;
      case 'assignedTo':
        return (ticket.assignedTo?.name || '').toLowerCase().includes(term);
      default:
        return true;
    }
  });

  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        My Tickets
      </Typography>
      <Button component={Link} href="/dashboard/user/tickets/new" variant="contained" sx={{ mb: 2 }}>
        Create Ticket
      </Button>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchCategory}
            label="Search By"
            onChange={e => setSearchCategory(e.target.value)}
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="facility">Facility</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="impact">Impact</MenuItem>
            <MenuItem value="assignedTo">Assigned To</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search Value"
          variant="outlined"
          size="small"
          fullWidth
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Impact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Denial Reason</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{ticket.facility.name}</TableCell>
                  <TableCell>{ticket.locationDetail || '-'}</TableCell>
                  <TableCell>
                    <Chip label={ticket.priority} color={priorityColors[ticket.priority]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.impactLevel} color={impactLevelColors[ticket.impactLevel]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.status} color={statusColors[ticket.status]} size="small" />
                  </TableCell>
                  <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{ticket.denialReason || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal(ticket)} size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
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

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedTicket && (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Ticket Details: {selectedTicket.title}
              </Typography>
              <Box sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                    <strong>Status:</strong>
                  </Typography>
                  <Chip label={selectedTicket.status} color={statusColors[selectedTicket.status]} size="small" />
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Facility:</strong> {selectedTicket.facility.name}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Location:</strong> {selectedTicket.locationDetail || '-'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                    <strong>Priority:</strong>
                  </Typography>
                  <Chip label={selectedTicket.priority} color={priorityColors[selectedTicket.priority]} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                    <strong>Impact:</strong>
                  </Typography>
                  <Chip label={selectedTicket.impactLevel} color={impactLevelColors[selectedTicket.impactLevel]} size="small" />
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Description:</strong> {selectedTicket.description}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Purpose:</strong> {selectedTicket.purpose}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Assigned To:</strong> {selectedTicket.assignedTo?.name || 'Unassigned'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Requested Completion:</strong>{' '}
                  {selectedTicket.requestedCompletionDate
                    ? new Date(selectedTicket.requestedCompletionDate).toLocaleDateString()
                    : '-'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Materials Request:</strong> {selectedTicket.requestOfMaterials || '-'}
                </Typography>
                {selectedTicket.photoUrl && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Attachment:</strong> <Link href={selectedTicket.photoUrl} target="_blank" rel="noopener noreferrer">View Image</Link>
                  </Typography>
                )}
                {selectedTicket.denialReason && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Denial Reason:</strong> {selectedTicket.denialReason}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <em>Created by {selectedTicket.user?.name || 'N/A'} ({selectedTicket.user?.email || 'N/A'}) on {new Date(selectedTicket.createdAt).toLocaleString()}</em>
                </Typography>
              </Box>
              <Button onClick={handleCloseModal} sx={{ mt: 3 }}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
} 