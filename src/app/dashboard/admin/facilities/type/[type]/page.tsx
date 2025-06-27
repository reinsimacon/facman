'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography, Box, Button, TextField, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, CircularProgress, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function FacilityTypePage() {
  const params = useParams();
  const router = useRouter();
  const type = decodeURIComponent(params.type as string);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      const res = await fetch('/api/facilities', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setFacilities((data.facilities || []).filter((f: Facility) => f.type === type));
      setLoading(false);
    };
    fetchFacilities();
  }, [type]);

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
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {type} Facilities
      </Typography>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => router.push('/dashboard/admin/facilities')}>Back to Categories</Button>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchCategory}
            label="Search By"
            onChange={e => setSearchCategory(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="floorOrZone">Floor/Zone</MenuItem>
            <MenuItem value="location">Location</MenuItem>
          </Select>
        </FormControl>
        <TextField label={`Search ${searchCategory.charAt(0).toUpperCase() + searchCategory.slice(1)}`} variant="outlined" size="small" fullWidth value={search} onChange={e => setSearch(e.target.value)} />
      </Box>
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
            {loading ? <TableRow><TableCell colSpan={7}><CircularProgress /></TableCell></TableRow>
              : paginatedFacilities.map(facility => (
                <TableRow key={facility.id}>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{facility.type || '-'}</TableCell>
                  <TableCell>{facility.floorOrZone || '-'}</TableCell>
                  <TableCell>{facility.location || '-'}</TableCell>
                  <TableCell>{facility.nextPlannedPMDate ? new Date(facility.nextPlannedPMDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{facility.lastInspectionDate ? new Date(facility.lastInspectionDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <IconButton /* onClick={...} */><EditIcon /></IconButton>
                    <IconButton /* onClick={...} */ color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
    </Box>
  );
} 