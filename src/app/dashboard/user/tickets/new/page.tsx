"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface Facility {
  id: string;
  name: string;
}

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const impactLevels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];

const steps = [
  'Basic Info',
  'Ticket Details',
  'Attachments & Materials',
  'Review & Submit',
];

export default function CreateTicketPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    facilityId: '',
    requestOfMaterials: '',
    priority: 'MEDIUM',
    locationDetail: '',
    impactLevel: 'LOW',
    requestedCompletionDate: '',
    photoUrl: '',
    documentUrl: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/facilities");
        const data = await res.json();
        setFacilities(data.facilities || []);
      } catch {
        setFacilities([]);
      }
    };
    fetchFacilities();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    // Mock upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForm(prev => ({ ...prev, photoUrl: file.name }));
    setIsUploading(false);
  };
  const handleDocChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocUploading(true);
    // Mock upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForm(prev => ({ ...prev, documentUrl: file.name }));
    setIsDocUploading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFeedback({ type: 'error', message: 'You must be logged in to create a ticket.' });
        setLoading(false);
        return;
      }
      
      const body: { [key: string]: any } = { ...form, purpose: form.description };
      if (!body.requestedCompletionDate) {
        delete body.requestedCompletionDate;
      }
      if (!body.photoUrl) {
        delete body.photoUrl;
      }
      if (!body.documentUrl) {
        delete body.documentUrl;
      }
      if (!body.remarks) {
        delete body.remarks;
      }
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Ticket submitted! Redirecting...' });
        setTimeout(() => router.push('/dashboard/user/tickets'), 2000);
      } else {
        const errorData = await res.json();
        setFeedback({ type: 'error', message: errorData.error || 'Failed to create ticket.' });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setFeedback({ type: 'error', message: errorMessage });
    }
  };

  const handleCloseFeedback = () => {
    setFeedback(null);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box maxWidth="md" mx="auto" sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Create New Ticket
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Basic Info</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" noValidate autoComplete="off">
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 3 }}
              />
              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel>Facility</InputLabel>
                <Select name="facilityId" value={form.facilityId} label="Facility" onChange={handleChange}>
                  {facilities.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Describe the issue"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                minRows={3}
                helperText="Please provide as much detail as possible."
                sx={{ mb: 3 }}
              />
              <TextField
                label="Location Detail (e.g., Room 510B)"
                name="locationDetail"
                value={form.locationDetail}
                onChange={handleChange}
                fullWidth
                helperText="Optional: Where is the issue?"
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" onClick={handleNext} disabled={!form.title || !form.description || !form.facilityId}>
                  Next
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {activeStep === 1 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Ticket Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" noValidate autoComplete="off">
              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel>Impact Level</InputLabel>
                <Select name="impactLevel" value={form.impactLevel} label="Impact Level" onChange={handleChange}>
                  {impactLevels.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={form.priority} label="Priority" onChange={handleChange}>
                  {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Requested Completion Date"
                name="requestedCompletionDate"
                type="date"
                value={form.requestedCompletionDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="When do you need this done? (Optional)"
                sx={{ mb: 3 }}
              />
              <TextField
                label="Request of Materials (Optional)"
                name="requestOfMaterials"
                value={form.requestOfMaterials}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                helperText="List any materials you need for this ticket."
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {activeStep === 2 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Attachments & Materials</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" noValidate autoComplete="off">
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Photo</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isUploading}
                  sx={{ mb: 1 }}
                >
                  {form.photoUrl ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {form.photoUrl && (
                  <Typography variant="body2" sx={{ mt: 1 }}>Selected: {form.photoUrl}</Typography>
                )}
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Document (Optional)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isDocUploading}
                  sx={{ mb: 1 }}
                >
                  {form.documentUrl ? 'Change Document' : 'Upload Document'}
                  <input type="file" hidden accept=".pdf,.doc,.docx,.docx" onChange={handleDocChange} />
                </Button>
                {form.documentUrl && (
                  <Typography variant="body2" sx={{ mt: 1 }}>Selected: {form.documentUrl}</Typography>
                )}
              </Box>
              <TextField
                label="Remarks (Optional)"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                helperText="Any additional notes or remarks."
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {activeStep === 3 && (
        <form onSubmit={handleSubmit}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Review & Submit</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Title</Typography>
                <Typography sx={{ mb: 2 }}>{form.title}</Typography>
                <Typography variant="subtitle2">Facility</Typography>
                <Typography sx={{ mb: 2 }}>{facilities.find(f => f.id === form.facilityId)?.name || ''}</Typography>
                <Typography variant="subtitle2">Describe the issue</Typography>
                <Typography sx={{ mb: 2 }}>{form.description}</Typography>
                <Typography variant="subtitle2">Location</Typography>
                <Typography sx={{ mb: 2 }}>{form.locationDetail}</Typography>
                <Typography variant="subtitle2">Impact Level</Typography>
                <Typography sx={{ mb: 2 }}>{form.impactLevel}</Typography>
                <Typography variant="subtitle2">Priority</Typography>
                <Typography sx={{ mb: 2 }}>{form.priority}</Typography>
                <Typography variant="subtitle2">Requested Completion Date</Typography>
                <Typography sx={{ mb: 2 }}>{form.requestedCompletionDate}</Typography>
                <Typography variant="subtitle2">Request of Materials</Typography>
                <Typography sx={{ mb: 2 }}>{form.requestOfMaterials}</Typography>
                <Typography variant="subtitle2">Uploaded Photo</Typography>
                <Typography sx={{ mb: 2 }}>{form.photoUrl || 'None'}</Typography>
                <Typography variant="subtitle2">Uploaded Document</Typography>
                <Typography sx={{ mb: 2 }}>{form.documentUrl || 'None'}</Typography>
                <Typography variant="subtitle2">Remarks</Typography>
                <Typography sx={{ mb: 2 }}>{form.remarks || 'None'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
      </Box>
            </CardContent>
          </Card>
        </form>
      )}
      <Snackbar open={!!feedback} autoHideDuration={4000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseFeedback} severity={feedback?.type || 'success'} sx={{ width: '100%' }}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 