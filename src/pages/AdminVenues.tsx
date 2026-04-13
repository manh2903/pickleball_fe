import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Card, Typography, 
  IconButton, Chip, TextField, Stack, MenuItem, 
  Tooltip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Grid, Divider, ImageList, ImageListItem,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert
} from '@mui/material';
import { 
  Visibility, Place, Phone, AccessTime,
  AttachMoney, SportsTennis, Person, Info
} from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const AdminVenues = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail Dialog State
  const [viewingVenueId, setViewingVenueId] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data: venuesRes, isLoading } = useQuery({
    queryKey: ['admin-venues', statusFilter, search, page, rowsPerPage],
    queryFn: () => adminApi.getVenues({ status: statusFilter, search, page: page + 1, limit: rowsPerPage })
  });

  // Fetch individual venue detail
  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-venue-detail', viewingVenueId],
    queryFn: () => adminApi.getVenueDetail(viewingVenueId!),
    enabled: !!viewingVenueId && openDetail
  });

  const venues = venuesRes?.data?.venues || [];
  const totalVenues = venuesRes?.data?.total || 0;
  const venueDetail = detailRes?.data;

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active': return <Chip label="Đang hoạt động" color="success" size="small" variant="outlined" sx={{ fontWeight: 800 }} />;
      case 'pending_review': return <Chip label="Đang khởi tạo" color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'suspended': return <Chip label="Đã đóng cửa" color="error" size="small" sx={{ fontWeight: 800 }} />;
      default: return <Chip label="Ngừng hoạt động" color="default" size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  const handleOpenDetail = (id: number) => {
    setViewingVenueId(id);
    setOpenDetail(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'venue',
      label: 'Thông tin Địa điểm',
      render: (venue: any) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{venue.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Place sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {venue.address}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Phone sx={{ fontSize: 14, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
               {venue.phone || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'owner',
      label: 'Chủ sở hữu',
      render: (venue: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 900, fontSize: '0.8rem' }}>
             {venue.owner?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{venue.owner?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{venue.owner?.email}</Typography>
          </Box>
        </Stack>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái vận hành',
      render: (venue: any) => getStatusChip(venue.status)
    },
    {
      key: 'actions',
      label: 'Chi tiết',
      align: 'right',
      render: (venue: any) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Xem thông tin chi tiết sân">
            <IconButton size="small" onClick={() => handleOpenDetail(venue.id)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
        Quản lý Địa điểm Đối tác 🏢
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Theo dõi trạng thái vận hành và thông tin chi tiết của các cơ sở sân trên toàn hệ thống.
      </Typography>

      <Card sx={{ p: 0, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <AdminFilterBar
            search={search}
            onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
            searchPlaceholder="Tìm tên sân, địa chỉ..."
            onReset={() => {
              setSearch('');
              setStatusFilter('');
              setPage(0);
            }}
            disableReset={search === '' && statusFilter === ''}
          >
            <TextField 
              select 
              size="small" 
              label="Trạng thái vận hành" 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="pending_review">Đang khởi tạo</MenuItem>
              <MenuItem value="suspended">Đã đóng cửa</MenuItem>
            </TextField>
          </AdminFilterBar>
        </Box>

        <Box sx={{ px: 3, pb: 3, mt: 3 }}>
          <DataTable 
            columns={columns}
            data={venues}
            isLoading={isLoading}
            count={totalVenues}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Box>
      </Card>

      {/* Venue Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          🏢 Hồ sơ chi tiết Địa điểm
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingDetail ? (
             <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
          ) : venueDetail ? (
            <Box>
                {/* Images Gallery */}
                {venueDetail.images?.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: '#0F172A' }}>
                    <ImageList sx={{ height: 260, m: 0 }} cols={3} rowHeight={260} gap={8}>
                        {venueDetail.images.map((img: string, index: number) => (
                           <ImageListItem key={index}>
                              <img src={`${import.meta.env.VITE_API_URL}${img}`} alt="Venue" style={{ objectFit: 'cover', borderRadius: 8 }} />
                           </ImageListItem>
                        ))}
                    </ImageList>
                  </Box>
                )}

                <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{venueDetail.name}</Typography>
                            <Stack spacing={1} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Place color="primary" sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">{venueDetail.address}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTime color="warning" sx={{ fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {venueDetail.open_time} - {venueDetail.close_time}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Phone color="success" sx={{ fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{venueDetail.phone}</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Info fontSize="small" /> MÔ TẢ & TIỆN ÍCH
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{venueDetail.description || 'Không có mô tả.'}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {venueDetail.amenities?.map((am: string) => (
                                    <Chip key={am} label={am} size="small" variant="outlined" />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={5}>
                             <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #DCFCE7', mb: 3 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                    <AttachMoney fontSize="inherit" /> BẢNG GIÁ NIÊM YẾT (VNĐ/Giờ)
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Sáng (Trước 17h):</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(venueDetail.default_price_morning)}đ</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Chiều (17h - 22h):</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(venueDetail.default_price_afternoon)}đ</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Tối (Sau 22h):</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(venueDetail.default_price_evening)}đ</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Phụ phí cuối tuần:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>+{venueDetail.default_price_weekend_surcharge}%</Typography>
                                    </Box>
                                </Stack>
                             </Box>

                             <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                    <Person fontSize="inherit" /> NGƯỜI QUẢN LÝ (OWNER)
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={venueDetail.owner?.avatar} sx={{ width: 40, height: 40 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{venueDetail.owner?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{venueDetail.owner?.email}</Typography>
                                    </Box>
                                </Stack>
                             </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SportsTennis /> DANH SÁCH SÂN ({venueDetail.courts?.length || 0})
                        </Typography>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Tên sân</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Loại sân</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Mô tả</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {venueDetail.courts?.map((court: any) => (
                                    <TableRow key={court.id}>
                                        <TableCell sx={{ fontWeight: 700 }}>{court.name}</TableCell>
                                        <TableCell>
                                            <Chip label={court.type === 'indoor' ? 'Trong nhà' : 'Ngoài trời'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{court.description || '-'}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={court.status === 'active' ? 'Hoạt động' : 'Tạm dừng'} 
                                                size="small" 
                                                color={court.status === 'active' ? 'success' : 'default'} 
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            </Box>
          ) : (
            <Alert severity="warning">Không tìm thấy dữ liệu.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Đóng hồ sơ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminVenues;
