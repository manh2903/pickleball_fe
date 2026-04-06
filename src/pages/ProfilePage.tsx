import { useState } from 'react';
import { 
  Box, Container, Typography, Card, Grid, 
  Avatar, Button, TextField, Divider, Stack,
  Tabs, Tab, Alert, IconButton, CircularProgress,
  Paper
} from '@mui/material';
import { 
  Person, Security, Loyalty, PhotoCamera,
  Email, Phone, Save, VerifiedUser, Star
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import { useSnackbar } from 'notistack';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Times New Roman' }}>
            Hồ sơ cá nhân 👤
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý thông tin cá nhân, bảo mật và điểm thưởng của bạn.
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
              
              <Box sx={{ bgcolor: 'rgba(34,197,94,0.05)', p: 2, borderRadius: 1.5, border: '1px dashed', borderColor: 'primary.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Star sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {user.points || 0}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  DIỂM TÍCH LŨY (LOYALTY)
                </Typography>
              </Box>
              
              <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 1 }}>
                Lịch sử ví điểm
              </Button>
            </Card>

            <Paper sx={{ p: 3, borderRadius: 1.5 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ mr: 1, color: 'success.main', fontSize: '1.2rem' }} />
                  <Typography variant="body2">Tài khoản đã xác minh</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Loyalty sx={{ mr: 1, color: 
                    user.member_rank === 'platinum' ? '#E5E4E2' : 
                    user.member_rank === 'gold' ? '#FFD700' : 
                    user.member_rank === 'silver' ? '#C0C0C0' : '#CD7F32'
                  , fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Hạng: {
                      user.member_rank === 'platinum' ? 'Bạch Kim' :
                      user.member_rank === 'gold' ? 'Vàng' :
                      user.member_rank === 'silver' ? 'Bạc' : 'Đồng'
                    }
                  </Typography>
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
