'use client';

import { Typography, Box, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar } from '@mui/material';
import { useState, useEffect, FormEvent } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SelectChangeEvent } from '@mui/material';

type Role = 'ADMIN' | 'USER' | 'MAINTENANCE';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const roles: Role[] = ['ADMIN', 'USER', 'MAINTENANCE'];

export default function AdminUsersPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' as Role });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<Role>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = (user: User | null = null) => {
    setEditUser(user);
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'USER',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setEditUser(null);
  };

  const handleSave = async () => {
    const url = editUser ? `/api/users?id=${editUser.id}` : '/api/users';
    const method = editUser ? 'PUT' : 'POST';

    try {
      const body = editUser ? { ...form, id: editUser.id } : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save user.');
      
      if (editUser && form.role !== editUser.role) {
        setSuccess('User updated. The user must log out and log in again for the new role to take effect.');
      } else {
        setSuccess(editUser ? 'User updated successfully.' : 'User created successfully.');
      }
      
      fetchUsers();
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSave();
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = search 
      ? user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())
      : true;
    const roleMatch = roleFilter ? user.role === roleFilter : true;
    return searchMatch && roleMatch;
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Users
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search by Name/Email"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            label="Filter by Role"
            onChange={e => setRoleFilter(e.target.value as Role | '')}
          >
            <MenuItem value=""><em>All Roles</em></MenuItem>
            {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpen()}>
        Add User
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320
        }}>
          <Typography variant="h6" mb={2}>{editUser ? 'Edit User' : 'Add User'}</Typography>
          <form onSubmit={onFormSubmit}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required type="email" />
            <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required={!editUser} type="password" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                label="Role"
                onChange={handleChange}
              >
                {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
              {editUser ? 'Update' : 'Add'}
            </Button>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={4}>No users found.</TableCell></TableRow>
            ) : filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
