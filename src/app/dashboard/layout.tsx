"use client";
import { ReactNode, useState, useEffect } from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, ListItemButton, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import BusinessIcon from '@mui/icons-material/Business';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';

const drawerWidth = 240;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'ADMIN' | 'USER' | 'MAINTENANCE' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const decoded = jwtDecode<{ role: 'ADMIN' | 'USER' | 'MAINTENANCE', name?: string }>(token);
      if (!decoded || !decoded.role) throw new Error('Invalid token');
      setRole(decoded.role);
      setUserName(decoded.name || null);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    localStorage.removeItem('token');
    router.push('/login');
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const drawer = (
    <div style={{ background: '#202124', height: '100%', color: '#fff' }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ color: '#fff', fontWeight: 700 }}>Facility Manager</Typography>
      </Toolbar>
      {userName && (
        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500, px: 2, mt: 1, mb: 2 }}>
          Welcome, {userName}!
        </Typography>
      )}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List>
        <ListItem disablePadding component={Link} href="/dashboard">
          <ListItemButton>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        
        {role === 'ADMIN' && (
          <>
            <ListItem disablePadding component={Link} href="/dashboard/admin/tickets">
              <ListItemButton><ListItemIcon><ConfirmationNumberIcon /></ListItemIcon><ListItemText primary="Manage Tickets" /></ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} href="/dashboard/admin/users">
              <ListItemButton><ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText primary="Manage Users" /></ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} href="/dashboard/admin/facilities">
              <ListItemButton><ListItemIcon><BusinessIcon /></ListItemIcon><ListItemText primary="Manage Facilities" /></ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} href="/dashboard/admin/announcements">
              <ListItemButton><ListItemIcon><CampaignIcon /></ListItemIcon><ListItemText primary="Manage Announcements" /></ListItemButton>
            </ListItem>
          </>
        )}

        {role === 'USER' && (
          <>
            <ListItem disablePadding component={Link} href="/dashboard/user/tickets">
              <ListItemButton><ListItemIcon><ConfirmationNumberIcon /></ListItemIcon><ListItemText primary="My Tickets" /></ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} href="/dashboard/user/announcements">
              <ListItemButton><ListItemIcon><CampaignIcon /></ListItemIcon><ListItemText primary="Announcements" /></ListItemButton>
            </ListItem>
          </>
        )}

        {role === 'MAINTENANCE' && (
          <>
            <ListItem disablePadding component={Link} href="/dashboard/maintenance/tickets">
              <ListItemButton><ListItemIcon><AssignmentIcon /></ListItemIcon><ListItemText primary="My Assigned Tickets" /></ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} href="/dashboard/maintenance/announcements">
              <ListItemButton><ListItemIcon><CampaignIcon /></ListItemIcon><ListItemText primary="Announcements" /></ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Button variant="outlined" color="error" fullWidth onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">Cancel</Button>
          <Button onClick={confirmLogout} color="error" autoFocus>Logout</Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  // Prevent hydration mismatch: don't render until role is known
  if (role === null) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#232526', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.12)' }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="go home" sx={{ mr: 1 }} component={Link} href={role === 'ADMIN' ? '/dashboard/admin' : role === 'USER' ? '/dashboard/user' : '/dashboard/maintenance'}>
            <DashboardIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#202124', color: '#fff' } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#202124', color: '#fff', borderRight: '1px solid #232526' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', bgcolor: 'transparent', color: '#fff', position: 'relative' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 