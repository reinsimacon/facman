'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Typography, Box, Grid, Chip, Card, CardHeader, CardContent, Table, TableBody, TableCell, TableRow, TableHead, TableContainer } from '@mui/material';
import { Business, Wc, Warehouse, Elevator, MeetingRoom, Kitchen, Public } from '@mui/icons-material';

interface Ticket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Facility {
  id: string;
  name: string;
  location?: string;
  type?: string;
  floorOrZone?: string;
  areaSqm?: number | null;
  isCritical?: boolean;
  maintenanceFrequency?: string;
  lastInspectionDate?: string;
  nextPlannedPMDate?: string;
  remarks?: string;
  tickets?: Ticket[];
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  DENIED: 'error',
};

const FacilityTypeIcon = ({ type }: { type?: string }) => {
  const icons: Record<string, React.ReactElement> = {
    Office: <Business />,
    'Common Area': <Public />,
    Bathroom: <Wc />,
    Elevator: <Elevator />,
    Warehouse: <Warehouse />,
    'Meeting Room': <MeetingRoom />,
    Kitchen: <Kitchen />,
  };
  return icons[type || ''] || null;
};

export default function FacilityProfilePage() {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchFacility = async () => {
        setLoading(true);
        const res = await fetch(`/api/facilities/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFacility(data);
        }
        setLoading(false);
      };
      fetchFacility();
    }
  }, [id]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!facility) return <Typography>Facility not found.</Typography>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Facility Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              title={facility.name}
              subheader={facility.location}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>Details</Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FacilityTypeIcon type={facility.type} />
                    <Typography sx={{ ml: 1 }}><strong>Type:</strong> {facility.type || '-'}</Typography>
                  </Box>
                  <Typography><strong>Floor/Zone:</strong> {facility.floorOrZone || '-'}</Typography>
                  <Typography><strong>Area (sqm):</strong> {facility.areaSqm ?? '-'}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography mr={1}><strong>Critical:</strong></Typography>
                    <Chip label={facility.isCritical ? 'Yes' : 'No'} color={facility.isCritical ? 'error' : 'default'} size="small" />
                  </Box>
                </Grid>
                <Grid xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>Maintenance</Typography>
                  <Typography><strong>Frequency:</strong> {facility.maintenanceFrequency || '-'}</Typography>
                  <Typography><strong>Last Inspection:</strong> {facility.lastInspectionDate ? new Date(facility.lastInspectionDate).toLocaleDateString() : '-'}</Typography>
                  <Typography><strong>Next PM:</strong> {facility.nextPlannedPMDate ? new Date(facility.nextPlannedPMDate).toLocaleDateString() : '-'}</Typography>
                </Grid>
                <Grid xs={12} md={4}>
                  {facility.remarks && (
                    <>
                      <Typography variant="h6" gutterBottom>Remarks</Typography>
                      <Typography paragraph>{facility.remarks}</Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader title="Open Tickets" />
            <CardContent>
              {facility.tickets && facility.tickets.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ticket Title</TableCell>
                        <TableCell>Created Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {facility.tickets.map(ticket => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={ticket.status} color={statusColors[ticket.status] || 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No open tickets for this facility.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 