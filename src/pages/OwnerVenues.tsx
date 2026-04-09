import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Button, Chip, IconButton, TextField, InputAdornment,
  Stack, Avatar, Tooltip, CircularProgress, Alert
} from '@mui/material';
import { 
  Add, Search, Edit, Visibility, 
  LocationOn, Phone, SportsTennis, 
  Star, MoreVert
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ownerApi } from '@/api/ownerApi';

const OwnerVenues = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: venuesRes, isLoading, error } = useQuery({
    queryKey: ['owner-venues-list'],
    queryFn: () => ownerApi.getVenues(),
  });

  const venues = venuesRes?.data || [];

  const filteredVenues = venues.filter((v: any) => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: number | string) => {
    // Set as active venue first then navigate to settings
    localStorage.setItem('activeVenueId', id.toString());
    navigate('/owner/settings');
    window.location.reload(); // To update the entire layout context
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Lỗi khi tải danh sách cơ sở.</Alert>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>
             Danh sách Cơ sở 🏟️
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và theo dõi trạng thái hoạt động của tất cả các sân của bạn.
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/owner/venues/add" 
          variant="contained" 
          startIcon={<Add />}
          sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 800 }}
        >
          Thêm cơ sở mới
        </Button>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
          <TextField
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 350, bgcolor: 'white', borderRadius: 1.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CƠ SỞ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>QUY MÔ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ĐỊA CHỈ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>LIÊN HỆ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>TRẠNG THÁI</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>HÀNH ĐỘNG</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.map((venue: any) => (
                <TableRow key={venue.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={venue.images?.[0]} 
                        variant="rounded" 
                        sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.light' }}
                      >
                        <SportsTennis />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{venue.name}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Star sx={{ fontSize: 14, color: '#F59E0B' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{venue.avg_rating || '5.0'}</Typography>
                          <Typography variant="caption" color="text.secondary">({venue.review_count || 0})</Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${venue.courts.length || 0} Sân`} 
                      size="small" 
                      sx={{ fontWeight: 800, bgcolor: '#F0F9FF', color: '#0EA5E9', border: '1px solid #BAE6FD' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                       <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} /> {venue.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                       <Phone sx={{ fontSize: 16, color: 'text.secondary' }} /> {venue.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={venue.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'} 
                      color={venue.status === 'active' ? 'success' : 'warning'} 
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Chi tiết & Chỉnh sửa">
                        <IconButton onClick={() => handleEdit(venue.id)} sx={{ bgcolor: '#F1F5F9' }}>
                          <Edit fontSize="small"  />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xem trang công khai">
                        <IconButton component={Link} to={`/venues/${venue.slug}`} target="_blank" sx={{ bgcolor: '#F1F5F9' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton>
                         <MoreVert fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVenues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">Không tìm thấy cơ sở nào phù hợp.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OwnerVenues;
