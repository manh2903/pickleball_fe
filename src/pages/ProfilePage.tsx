import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, Grid, 
  Avatar, Button, TextField, Divider, Stack,
  Tabs, Tab, Alert, IconButton, CircularProgress,
  Paper
} from '@mui/material';
import { 
  Person, Security, PhotoCamera,
  Email, Phone, Save, VerifiedUser,
  AccountBalanceWallet
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import { useSnackbar } from 'notistack';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
  // Real-time wallet balance
  const { data: meData } = useQuery({
    queryKey: ['auth-me-profile'],
    queryFn: () => authApi.getMe(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    const freshUser = meData?.data?.user || meData?.data;
    if (freshUser?.wallet_balance !== undefined) {
      updateUser({ wallet_balance: freshUser.wallet_balance });
    }
  }, [meData]);

  const freshUser = meData?.data?.user || meData?.data;
  const walletBalance = freshUser?.wallet_balance ?? user?.wallet_balance ?? 0;

  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password Form States
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateMe(profileData);
      updateUser(res.data);
      enqueueSnackbar('Cập nhật hồ sơ thành công!', { variant: 'success' });
      setIsEditing(false);
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi khi cập nhật hồ sơ', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Mật khẩu xác nhận không khớp', { variant: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      await authApi.changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      enqueueSnackbar('Đổi mật khẩu thành công!', { variant: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi khi đổi mật khẩu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Person color="primary" sx={{ fontSize: '2.5rem' }} />
            <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>
              Hồ sơ cá nhân
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Sidebar / Points Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 1.5, mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name} 
                  sx={{ width: 120, height: 120, mb: 2, mx: 'auto', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                />
                <IconButton 
                  sx={{ position: 'absolute', bottom: 15, right: 0, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{user.role.toUpperCase()}</Typography>
              
              <Divider sx={{ my: 3 }} />

              {/* Số dư ví */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                p: 3, borderRadius: 2, color: 'white', position: 'relative', overflow: 'hidden'
              }}>
                <AccountBalanceWallet sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 80, opacity: 0.15 }} />
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 1, display: 'block', mb: 0.5 }}>
                  SỐ DƯ VÍ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace', mb: 1.5 }}>
                  {new Intl.NumberFormat('vi-VN').format(walletBalance)}đ
                </Typography>
                <Button
                  component={Link}
                  to="/my-bookings"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)', color: 'white',
                    fontWeight: 800, fontSize: '0.72rem', px: 2, borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    textTransform: 'none'
                  }}
                >
                  Xem lịch sử đặt sân →
                </Button>
              </Box>
            </Card>

            <Paper sx={{ p: 3, borderRadius: 1.5 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ mr: 1, color: 'success.main', fontSize: '1.2rem' }} />
                  <Typography variant="body2">Tài khoản đã xác minh</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
              <Tabs 
                value={tabValue} 
                onChange={(_, val) => setTabValue(val)}
                sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2, bgcolor: 'white' }}
              >
                <Tab label="Thông tin chung" icon={<Person />} iconPosition="start" sx={{ fontWeight: 700, minHeight: 64 }} />
                <Tab label="Bảo mật" icon={<Security />} iconPosition="start" sx={{ fontWeight: 700, minHeight: 64 }} />
              </Tabs>

              <Box sx={{ p: 4, bgcolor: 'white' }}>
                {tabValue === 0 ? (
                  <Box component="form" onSubmit={handleProfileUpdate}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Thông tin cá nhân</Typography>
                        {!isEditing && (
                          <Button variant="text" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                        )}
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="Họ và Tên"
                        name="name"
                        value={profileData.name}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.disabled' }} /> }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Email"
                        value={user.email}
                        disabled
                        InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.disabled' }} /> }}
                        helperText="Email không thể thay đổi sau khi đăng ký."
                      />
                      
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={profileData.phone}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.disabled' }} /> }}
                      />

                      {isEditing && (
                        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                          <Button 
                            variant="contained" 
                            type="submit" 
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            sx={{ px: 4, borderRadius: 1 }}
                          >
                            Lưu thay đổi
                          </Button>
                          <Button 
                            variant="outlined" 
                            onClick={() => {
                              setIsEditing(false);
                              setProfileData({ name: user.name, phone: user.phone || '' });
                            }}
                            sx={{ borderRadius: 1 }}
                          >
                            Hủy
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handlePasswordChange}>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Đổi mật khẩu</Typography>
                      <Alert severity="info">Chúng tôi khuyên bạn nên sử dụng mật khẩu mạnh từ 8-20 ký tự.</Alert>
                      
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu hiện tại"
                        required
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      />
                      <Divider />
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu mới"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                      
                      <Button 
                        variant="contained" 
                        type="submit" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Security />}
                        sx={{ px: 4, py: 1.5, borderRadius: 1, alignSelf: 'flex-start' }}
                      >
                        Đổi mật khẩu
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage;
