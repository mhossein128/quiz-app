'use client';

import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

export default function UserManagementPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Role edit dialog state
  const [editDialog, setEditDialog] = useState({ open: false, user: null, newRole: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  // Check admin access
  if (user?.role !== 'ADMIN') {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Iconify icon="mdi:lock" width={64} sx={{ color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error">
            دسترسی غیرمجاز
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            فقط مدیران می‌توانند به این صفحه دسترسی داشته باشند
          </Typography>
          <Button onClick={() => router.push('/dashboard')}>بازگشت به داشبورد</Button>
        </Box>
      </DashboardContent>
    );
  }

  const handleOpenEditDialog = (userToEdit) => {
    setEditDialog({ open: true, user: userToEdit, newRole: userToEdit.role });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, user: null, newRole: '' });
  };

  const handleRoleChange = async () => {
    const { user: userToEdit, newRole } = editDialog;
    setError(null);
    setSuccess(null);

    try {
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      await axios.patch(
        `/api/users/${userToEdit.id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map((u) => (u.id === userToEdit.id ? { ...u, role: newRole } : u)));
      setSuccess(`نقش کاربر ${userToEdit.username} با موفقیت تغییر کرد`);
      handleCloseEditDialog();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'خطا در تغییر نقش کاربر');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getRoleLabel = (role) => (role === 'ADMIN' ? 'مدیر' : 'کاربر');

  return (
    <DashboardContent>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          مدیریت کاربران
        </Typography>
        <Typography variant="body2" color="text.secondary">
          مشاهده و مدیریت کاربران سیستم
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام کاربری</TableCell>
                  <TableCell>نقش</TableCell>
                  <TableCell>تاریخ ثبت‌نام</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: u.role === 'ADMIN' ? 'primary.lighter' : 'grey.200',
                          color: u.role === 'ADMIN' ? 'primary.dark' : 'text.secondary',
                        }}
                      >
                        {getRoleLabel(u.role)}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEditDialog(u)}
                        disabled={u.id === user?.id}
                        startIcon={<Iconify icon="mdi:pencil" />}
                      >
                        تغییر نقش
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Role Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog}>
        <DialogTitle>تغییر نقش کاربر</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            تغییر نقش کاربر <strong>{editDialog.user?.username}</strong>
          </Typography>
          <Select
            fullWidth
            value={editDialog.newRole}
            onChange={(e) => setEditDialog({ ...editDialog, newRole: e.target.value })}
          >
            <MenuItem value="USER">کاربر</MenuItem>
            <MenuItem value="ADMIN">مدیر</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleRoleChange}
            disabled={editDialog.newRole === editDialog.user?.role}
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
