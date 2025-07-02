"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Typography, Card, CardContent, Divider, Button, Chip, Avatar, Stack, CircularProgress
} from "@mui/material";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  impactLevel: string;
  createdAt: string;
  requestedCompletionDate?: string;
  locationDetail?: string;
  purpose?: string;
  photoUrl?: string;
  documentUrl?: string;
  user?: { name: string; email: string };
  facility?: { name: string; location?: string };
  assignedTo?: { name: string };
}

export default function AdminTicketDetailsPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTicket(data.ticket);
      setLoading(false);
    };
    if (ticketId) fetchTicket();
  }, [ticketId]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (!ticket) return <Box p={4}><Typography>Ticket not found.</Typography></Box>;

  return (
    <Box maxWidth="md" mx="auto" sx={{ p: { xs: 1, md: 4 } }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {ticket.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Ticket ID: {ticket.id}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
            <Chip label={ticket.status} color="info" />
            <Chip label={ticket.priority} color="warning" />
            <Chip label={ticket.impactLevel} color="error" />
            {ticket.assignedTo && <Chip label={`Assigned: ${ticket.assignedTo.name}`} color="primary" />}
          </Stack>
          <Typography variant="subtitle2">Created by</Typography>
          <Typography mb={1}>{ticket.user?.name} ({ticket.user?.email})</Typography>
          <Typography variant="subtitle2">Created at</Typography>
          <Typography mb={1}>{new Date(ticket.createdAt).toLocaleString()}</Typography>
          <Typography variant="subtitle2">Facility</Typography>
          <Typography mb={1}>{ticket.facility?.name} {ticket.facility?.location && `- ${ticket.facility.location}`}</Typography>
          <Typography variant="subtitle2">Requested Completion Date</Typography>
          <Typography mb={1}>{ticket.requestedCompletionDate ? new Date(ticket.requestedCompletionDate).toLocaleDateString() : "-"}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography mb={2}>{ticket.description}</Typography>
          <Typography variant="subtitle2">Location Details</Typography>
          <Typography mb={2}>{ticket.locationDetail || "-"}</Typography>
          <Typography variant="subtitle2">Purpose</Typography>
          <Typography mb={2}>{ticket.purpose || "-"}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Attachments</Typography>
          <Divider sx={{ mb: 2 }} />
          {ticket.photoUrl && (
            <Box mb={2}>
              <Typography variant="subtitle2">Photo</Typography>
              <Avatar src={ticket.photoUrl} variant="rounded" sx={{ width: 120, height: 120, mb: 1 }} />
              <Typography variant="body2">{ticket.photoUrl}</Typography>
            </Box>
          )}
          {ticket.documentUrl && (
            <Box mb={2}>
              <Typography variant="subtitle2">Document</Typography>
              <a href={ticket.documentUrl} target="_blank" rel="noopener noreferrer">{ticket.documentUrl}</a>
            </Box>
          )}
          {!ticket.photoUrl && !ticket.documentUrl && <Typography>No attachments.</Typography>}
        </CardContent>
      </Card>
      {/* Activity Log (optional) */}
      {/* <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Activity Log</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>No activity log available.</Typography>
        </CardContent>
      </Card> */}
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={() => router.push(`/dashboard/admin/tickets`)}>Back</Button>
        <Button variant="outlined" sx={{ ml: 2 }} onClick={() => router.push(`/dashboard/admin/tickets?edit=${ticket.id}`)}>Edit</Button>
      </Box>
    </Box>
  );
} 