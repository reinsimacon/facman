"use client";
import { Typography, Box, Button, Modal, TextField, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, MenuItem, TablePagination } from '@mui/material';
import { useState, useEffect, FormEvent } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { SelectChangeEvent } from '@mui/material';

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

interface FacilityForm {
  name: string;
  location: string;
  type: string;
  floorOrZone: string;
  areaSqm: string;
  maintenanceFrequency: string;
  lastInspectionDate?: string;
  nextPlannedPMDate?: string;
  remarks: string;
}

const facilityTypes = ['Office', 'Common Area', 'Bathroom', 'Elevator', 'Warehouse', 'Meeting Room', 'Kitchen'];
const maintenanceFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'NEVER'];

export default function AdminFacilitiesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FacilityForm>({ name: '', location: '', type: '', floorOrZone: '', areaSqm: '', maintenanceFrequency: 'NEVER', remarks: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editFacility, setEditFacility] = useState<Facility | null>(null);
  const [search, setSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState('name');
  const [detailFacility, setDetailFacility] = useState<Facility | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchFacilities = async () => {
    setLoading(true);
    const res = await fetch('/api/facilities', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    setFacilities(data.facilities || []);
    setLoading(false);
  };
  useEffect(() => { fetchFacilities(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpen = (facility: Facility | null = null) => {
    setEditFacility(facility);
    setForm(facility ? {
      name: facility.name || '',
      location: facility.location || '',
      type: facility.type || '',
      floorOrZone: facility.floorOrZone || '',
      areaSqm: facility.areaSqm !== null && facility.areaSqm !== undefined ? String(facility.areaSqm) : '',
      maintenanceFrequency: facility.maintenanceFrequency || 'NEVER',
      lastInspectionDate: facility.lastInspectionDate ? facility.lastInspectionDate.substring(0, 10) : undefined,
      nextPlannedPMDate: facility.nextPlannedPMDate ? facility.nextPlannedPMDate.substring(0, 10) : undefined,
      remarks: facility.remarks || '',
    } : { name: '', location: '', type: '', floorOrZone: '', areaSqm: '', maintenanceFrequency: 'NEVER', remarks: '' });
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setEditFacility(null);
  };

  const handleSave = async () => {
    setError(null);
    const url = editFacility ? `/api/facilities/${editFacility.id}` : '/api/facilities';
    const method = editFacility ? 'PUT' : 'POST';
    
    const { areaSqm, lastInspectionDate, nextPlannedPMDate, ...restOfForm } = form;

    const processedArea = areaSqm === '' ? null : parseFloat(areaSqm as string);

    if (processedArea !== null && isNaN(processedArea)) {
      setError('Area (sqm) must be a valid number.');
      return;
    }

    const body: Partial<Facility> = {
      ...restOfForm,
      areaSqm: processedArea,
      lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate).toISOString() : undefined,
      nextPlannedPMDate: nextPlannedPMDate ? new Date(nextPlannedPMDate).toISOString() : undefined,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to save facility.');
      }
      setSuccess(editFacility ? 'Facility updated successfully.' : 'Facility created successfully.');
      fetchFacilities();
      handleClose();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred.');
    }
  };

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSave();
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this facility? This cannot be undone.')) return;
    await fetch(`/api/facilities/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    fetchFacilities();
    setSuccess('Facility deleted successfully.');
  };

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
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Manage Facilities</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>Add Facility</Button>
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
      <Modal open={open} onClose={handleClose} sx={{ overflowY: 'auto' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, width: { xs: '90%', sm: 700 } }}>
          <Typography variant="h6" mb={2}>{editFacility ? 'Edit Facility' : 'Add Facility'}</Typography>
          <form onSubmit={onFormSubmit}>
            <TextField label="Name" name="name" value={form.name || ''} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Location" name="location" value={form.location || ''} onChange={handleChange} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select name="type" value={form.type || ''} label="Type" onChange={handleChange}>
                {facilityTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Floor / Zone" name="floorOrZone" value={form.floorOrZone || ''} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Area (sqm) (optional)" name="areaSqm" type="number" value={form.areaSqm || ''} onChange={handleChange} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Maintenance Frequency</InputLabel>
              <Select name="maintenanceFrequency" value={form.maintenanceFrequency || 'NEVER'} label="Maintenance Frequency" onChange={handleChange}>
                {maintenanceFrequencies.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Last Inspection Date" name="lastInspectionDate" type="date" value={form.lastInspectionDate || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Next Planned PM Date" name="nextPlannedPMDate" type="date" value={form.nextPlannedPMDate || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Remarks" name="remarks" multiline rows={3} value={form.remarks || ''} onChange={handleChange} fullWidth margin="normal" />
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>{editFacility ? 'Update' : 'Add'}</Button>
          </form>
        </Box>
      </Modal>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} message={success} />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                    <IconButton onClick={() => handleOpen(facility)}><EditOutlinedIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(facility.id)} color="error"><DeleteIcon /></IconButton>
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
  );
} 