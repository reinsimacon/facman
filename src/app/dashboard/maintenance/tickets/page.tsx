'use client';

import { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent,
  Stepper, Step, StepLabel, Snackbar, Alert, TextField, Divider, Card, CardContent,
  TablePagination,
} from '@mui/material';

// Interfaces & Types
interface Ticket {
  id: string;
  title: string;
  description?: string;
  purpose?: string;
  requestOfMaterials?: string;
  status: string;
  priority: string;
  impactLevel?: string;
  denialReason?: string;
  facility: { name: string };
  user: { name: string; email?: string };
  assignedTo?: { name: string };
  assignedToId?: string;
  createdAt: string;
  scheduledDate?: string;
  completionDate?: string;
  locationDetail?: string;
  requestedCompletionDate?: string;
  photoUrl?: string;
}

type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// Mappings for colors
const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};
const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error'
};

export default function ManageMaintenanceTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status>('OPEN');
  const [remarks, setRemarks] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  const [detailModalTicket, setDetailModalTicket] = useState<Ticket | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchCategory, setSearchCategory] = useState('title');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTickets(data.tickets || []);
      setLoading(false);
    };
    fetchTickets();
  }, []);

  const handleOpen = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setSelectedStatus(ticket.status as Status);
    setRemarks('');
    setPhotoFile(null);
    setDocFile(null);
    setActiveStep(0);
  };

  const handleClose = () => {
    setEditingTicket(null);
    setActiveStep(0);
    setRemarks('');
    setPhotoFile(null);
    setDocFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    const file = e.target.files?.[0] || null;
    if (type === 'photo') setPhotoFile(file);
    else setDocFile(file);
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSave = async () => {
    if (!editingTicket) return;
    // Only send status and remarks for now (backend unchanged)
    const res = await fetch('/api/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ticketId: editingTicket.id, status: selectedStatus }),
    });
    if (res.ok) {
      const updatedTicket = await res.json();
      setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setSnackbar({ open: true, message: 'Ticket updated!', type: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Failed to update ticket.', type: 'error' });
    }
    handleClose();
  };

  // Stepper steps
  const steps = ['Ticket Info', 'Update Status', 'Upload Files', 'Review & Submit'];

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
      case 'createdBy':
        return ticket.user.name.toLowerCase().includes(term);
      case 'assignedTo':
        return (ticket.assignedTo?.name || '').toLowerCase().includes(term);
      default:
        return true;
    }
  });
  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage My Tickets</Typography>
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
            <MenuItem value="createdBy">Created By</MenuItem>
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
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
            ) : paginatedTickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Button
                    variant="text"
                    sx={{
                      p: 0,
                      minWidth: 0,
                      textTransform: 'none',
                      background: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline', background: 'none' },
                    }}
                    onClick={() => setDetailModalTicket(ticket)}
                  >
                    {ticket.title}
                  </Button>
                </TableCell>
                <TableCell>{ticket.facility.name}</TableCell>
                <TableCell><Chip label={ticket.priority} color={priorityColors[ticket.priority]} size="small" /></TableCell>
                <TableCell><Chip label={ticket.status} color={statusColors[ticket.status]} size="small" /></TableCell>
                <TableCell><Button variant="outlined" size="small" onClick={() => handleOpen(ticket)}>Update</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      </TableContainer>

      <Dialog open={!!editingTicket} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Update Ticket</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          {activeStep === 0 && editingTicket && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ticket Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><b>Title:</b> {editingTicket.title}</Typography>
                <Typography><b>Facility:</b> {editingTicket.facility.name}</Typography>
                <Typography><b>Priority:</b> {editingTicket.priority}</Typography>
                <Typography><b>Created by:</b> {editingTicket.user.name}</Typography>
              </CardContent>
            </Card>
          )}
          {activeStep === 1 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Update Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select value={selectedStatus} label="Status" onChange={(e: SelectChangeEvent) => setSelectedStatus(e.target.value as Status)}>
                    {Object.keys(statusColors).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="Remarks (optional)"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          )}
          {activeStep === 2 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upload Files</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Upload Photo (optional)</Typography>
                  <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                    {photoFile ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'photo')} />
                  </Button>
                  {photoFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {photoFile.name}</Typography>}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Upload Document (optional)</Typography>
                  <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                    {docFile ? 'Change Document' : 'Upload Document'}
                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'doc')} />
                  </Button>
                  {docFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {docFile.name}</Typography>}
                </Box>
              </CardContent>
            </Card>
          )}
          {activeStep === 3 && editingTicket && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Review & Submit</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><b>Title:</b> {editingTicket.title}</Typography>
                <Typography><b>Facility:</b> {editingTicket.facility.name}</Typography>
                <Typography><b>Priority:</b> {editingTicket.priority}</Typography>
                <Typography><b>Status:</b> {selectedStatus}</Typography>
                <Typography><b>Remarks:</b> {remarks || 'None'}</Typography>
                <Typography><b>Photo:</b> {photoFile ? photoFile.name : 'None'}</Typography>
                <Typography><b>Document:</b> {docFile ? docFile.name : 'None'}</Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 && <Button onClick={handleNext} variant="contained">Next</Button>}
          {activeStep === steps.length - 1 && <Button onClick={handleSave} variant="contained">Submit</Button>}
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
                <Chip label={detailModalTicket.status} color={statusColors[detailModalTicket.status] || 'default'} size="small" />
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
                <Chip label={detailModalTicket.priority} color={priorityColors[detailModalTicket.priority] || 'default'} size="small" />
              </Box>
              {detailModalTicket.impactLevel && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                    <strong>Impact:</strong>
                  </Typography>
                  <Chip label={detailModalTicket.impactLevel} color={priorityColors[detailModalTicket.impactLevel] || 'default'} size="small" />
                </Box>
              )}
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Description:</strong> {detailModalTicket.description || '-'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Purpose:</strong> {detailModalTicket.purpose || '-'}
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
                  <strong>Attachment:</strong> <a href={detailModalTicket.photoUrl} target="_blank" rel="noopener noreferrer">View Image</a>
                </Typography>
              )}
              {detailModalTicket.denialReason && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Denial Reason:</strong> {detailModalTicket.denialReason}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mt: 2 }}>
                <em>Created by {detailModalTicket.user?.name || 'N/A'}{detailModalTicket.user?.email ? ` (${detailModalTicket.user.email})` : ''} on {detailModalTicket.createdAt ? new Date(detailModalTicket.createdAt).toLocaleString() : '-'}</em>
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