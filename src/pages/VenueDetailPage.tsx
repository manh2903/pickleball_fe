import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Container, Grid, Typography, Card, 
  Chip, Button, Rating, Divider, Tab, Tabs, 
  IconButton, CircularProgress, Alert,
  Avatar, Stack, Paper, Breadcrumbs, Tooltip
} from '@mui/material';
import { 
  LocationOn, Share, FavoriteBorder, Star, 
  ArrowBack, Wifi, DirectionsCar, Shower, 
  Storefront, Lightbulb, AccessTime, Phone,
  CheckCircle, NavigateNext
} from '@mui/icons-material';
import { useState } from 'react';
import { venueApi } from '@/api/venueApi';
import { reviewApi } from '@/api/reviewApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

const AMENITY_ICONS: any = {
  'Wifi': <Wifi />,
  'Gửi xe': <DirectionsCar />,
  'Phòng tắm': <Shower />,
  'Căng tin': <Storefront />,
  'Đèn chiếu sáng': <Lightbulb />,
  'Cho thuê vợt': <Star />,
};

const VenueDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['venue', slug],
    queryFn: () => venueApi.getVenueById(slug!),
    enabled: !!slug,
  });

  const venue = data?.data;

  const { data: reviewsRes, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['venue-reviews', slug],
    queryFn: () => reviewApi.getVenueReviews(slug!),
    enabled: !!slug,
  });

  const reviews = reviewsRes?.data?.reviews || [];

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !venue) return <Container sx={{ py: 10 }}><Alert severity="error">Không tìm thấy địa điểm.</Alert></Container>;

  const images = venue.images?.length > 0 ? venue.images : [
    "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626224580174-3239b61d4bf1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626224580174-3239b61d4bf1?q=80&w=2070&auto=format&fit=crop"
  ];

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', pb: 10 }}>
      {/* Premium Header / Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#64748B', fontWeight: 600 }}>Cơ sở</Link>
              <Typography color="text.primary" sx={{ fontWeight: 700 }}>{venue.name}</Typography>
            </Breadcrumbs>
             <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} size="small" sx={{ fontWeight: 700 }}>
              Quay lại
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero Gallery Section */}
      <Box sx={{ bgcolor: 'white', pb: 6 }}>
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Grid container spacing={1.5} sx={{ height: { xs: 300, md: 500 } }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ 
                width: '100%', height: '100%', borderRadius: 1.5, overflow: 'hidden', 
                position: 'relative', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
              }}>
                <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                  <Chip label="SIÊU CẤP" color="primary" sx={{ fontWeight: 800, borderRadius: 1 }} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Box sx={{ flex: 1, borderRadius: 1.5, overflow: 'hidden', boxShadow: 2 }}>
                  <img src={images[1] || images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, borderRadius: 1.5, overflow: 'hidden', position: 'relative', boxShadow: 2 }}>
                  <img src={images[2] || images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ 
                    position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                  }}>
                    <Typography color="white" variant="h6" sx={{ fontWeight: 700 }}>+{images.length} Ảnh</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: 'Times New Roman' }}>{venue.name}</Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Rating value={parseFloat(venue.avg_rating || '5')} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{venue.avg_rating || '5.0'}</Typography>
                  <Typography variant="caption" color="text.secondary">({venue.review_count || 0} Đánh giá)</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOn color="primary" sx={{ fontSize: '1.1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{venue.address}, {venue.district}</Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Chia sẻ">
                 <IconButton sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}><Share /></IconButton>
              </Tooltip>
              <Tooltip title="Yêu thích">
                <IconButton sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}><FavoriteBorder /></IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Information Grid */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column: Details & Reviews */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 1.5, overflow: 'hidden', mb: 4 }}>
              <Tabs 
                value={tabValue} 
                onChange={(_, v) => setTabValue(v)}
                sx={{ 
                  bgcolor: 'white', borderBottom: '1px solid #E2E8F0', p: 0.5,
                  '& .MuiTab-root': { fontWeight: 800, borderRadius: 1, px: 3 }
                }}
              >
                <Tab label="Tổng quan" />
                <Tab label="Cơ sở vật chất" />
                <Tab label="Đánh giá" />
              </Tabs>

              <Box sx={{ p: 3, bgcolor: 'white' }}>
                <TabPanel value={tabValue} index={0}>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <NavigateNext color="primary" /> Giới thiệu địa điểm
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8 }}>
                        {venue.description || 'Địa điểm này hiện chưa cung cấp mô tả chi tiết. Vui lòng liên hệ hotline để biết thêm thông tin về cơ sở vật chất và dịch vụ.'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Trang thiết bị & Tiện ích</Typography>
                      <Grid container spacing={2}>
                        {venue.amenities?.length > 0 ? (
                          venue.amenities?.map((item: string) => (
                            <Grid item xs={6} sm={4} key={item}>
                              <Box sx={{ 
                                display: 'flex', alignItems: 'center', gap: 2, p: 2, 
                                bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #F1F5F9',
                                transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F0F9FF' }
                              }}>
                                <Box sx={{ color: 'primary.main', display: 'flex' }}>
                                  {AMENITY_ICONS[item] || <CheckCircle fontSize="small" />}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item}</Typography>
                              </Box>
                            </Grid>
                          ))
                        ) : (
                          <Grid item xs={12}>
                            <Typography color="text.secondary">Chưa cập nhật danh sách tiện ích.</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Ngày & Giờ hoạt động</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, bgcolor: '#F0FDF4', borderRadius: 1.5, border: '1px solid #DCFCE7' }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1, display: 'flex' }}>
                          <AccessTime />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Mở cửa hàng ngày</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.dark' }}>{venue.open_time?.slice(0, 5)} — {venue.close_time?.slice(0, 5)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Danh sách sân chi tiết</Typography>
                  <Stack spacing={2}>
                    {venue.courts?.map((court: any) => (
                      <Paper key={court.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{court.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Sân chuẩn: {court.type}</Typography>
                        </Box>
                        <Chip 
                          label={court.status === 'active' ? 'Sẵn sàng' : 'Bảo trì'} 
                          color={court.status === 'active' ? 'success' : 'warning'} 
                          size="small" variant="filled" sx={{ fontWeight: 800 }} 
                        />
                      </Paper>
                    ))}
                    {venue.courts?.length === 0 && <Alert severity="info">Hiện chưa có sơ đồ sân chi tiết.</Alert>}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                   {isReviewsLoading ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
                   ) : (
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4, p: 2.5, bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
                      <Box sx={{ textAlign: 'center' }}>
                         <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main' }}>{venue.avg_rating || '5.0'}</Typography>
                         <Rating value={parseFloat(venue.avg_rating || '5')} precision={0.5} readOnly />
                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{venue.review_count || 0} Nhận xét</Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={1} sx={{ flex: 1 }}>
                         {[5, 4, 3, 2, 1].map(star => (
                           <Stack direction="row" alignItems="center" spacing={2} key={star}>
                              <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 700 }}>{star} sao</Typography>
                              <Box sx={{ flex: 1, height: 6, bgcolor: '#E2E8F0', borderRadius: 10 }}>
                                 <Box sx={{ width: star === 5 ? '85%' : '5%', height: '100%', bgcolor: 'primary.main', borderRadius: 10 }} />
                              </Box>
                           </Stack>
                         ))}
                      </Stack>
                   </Box>
                   )}

                   <Stack spacing={3}>
                    {reviews.map((rev: any) => (
                      <Box key={rev.id} sx={{ p: 3, borderBottom: '1px solid #F1F5F9' }}>
                        <Stack direction="row" spacing={2} mb={1.5}>
                          <Avatar src={rev.user?.avatar} sx={{ width: 44, height: 44, fontWeight: 800 }}>{rev.user?.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rev.user?.name}</Typography>
                            <Rating value={rev.rating} readOnly size="small" />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                             {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, color: '#334155', fontSize: '0.95rem' }}>
                          "{rev.comment}"
                        </Typography>
                        <Chip label={`Đã đặt: ${rev.court?.name}`} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                      </Box>
                    ))}
                    {reviews.length === 0 && <Alert severity="info">Địa điểm này hiện chưa có đánh giá nào.</Alert>}
                  </Stack>
                </TabPanel>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Sticky Booking CTA */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Card sx={{ 
                borderRadius: 2, p: 3, 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0', bgcolor: 'white'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                   Đặt lịch ngay ✨
                </Typography>
                
                <Stack spacing={3}>
                   <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: 1.5, border: '1px solid #E0F2FE' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>GIÁ TỪ</Typography>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 900 }}>
                         {new Intl.NumberFormat('vi-VN').format(venue.default_price_morning || 0)}đ <Typography component="span" variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>/giờ</Typography>
                      </Typography>
                   </Box>

                   <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                         <CheckCircle color="success" sx={{ fontSize: '1.2rem' }} /> Ưu đãi đặt sân
                      </Typography>
                      <ul style={{ paddingLeft: 20, margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                         <li style={{ marginBottom: 4 }}>Miễn phí gửi xe & nước lọc</li>
                         <li style={{ marginBottom: 4 }}>Điểm thưởng thành viên x2</li>
                         <li>Dễ dàng đổi lịch trước 24h</li>
                      </ul>
                   </Box>

                   <Button 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    sx={{ py: 1.8, borderRadius: 1.5, fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 10px 15px -3px rgba(34,197,94,0.3)' }}
                    component={Link}
                    to={`/booking/${venue.id}`}
                  >
                    XEM LỊCH TRỐNG 📅
                  </Button>

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.5}>
                     <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Hỗ trợ Trực tiếp</Typography>
                     <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<Phone />}
                      href={`tel:${venue.phone}`}
                      sx={{ borderRadius: 1.5, py: 1, fontWeight: 700 }}
                     >
                        {venue.phone || 'Chưa cập nhật SĐT'}
                     </Button>
                  </Stack>
                </Stack>
              </Card>

              <Paper sx={{ mt: 3, p: 2, borderRadius: 1.5, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                 <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Vị trí địa lý</Typography>
                 <Box sx={{ 
                   height: 180, bgcolor: '#F1F5F9', borderRadius: 1.5, 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   border: '1px dashed #CBD5E1', overflow: 'hidden'
                 }}>
                    <Stack alignItems="center" spacing={1}>
                       <LocationOn sx={{ fontSize: 40, color: 'text.disabled' }} />
                       <Typography variant="caption" color="text.secondary">Bản đồ đang cập nhật...</Typography>
                    </Stack>
                 </Box>
                 <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontStyle: 'italic' }}>
                   * Vui lòng liên hệ hotline nếu bạn gặp khó khăn khi tìm đường.
                 </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VenueDetailPage;
