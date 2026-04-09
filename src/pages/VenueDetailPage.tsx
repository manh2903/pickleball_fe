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
  CheckCircle, NavigateNext, OpenInNew
} from '@mui/icons-material';
import { useState } from 'react';

import { venueApi } from '@/api/venueApi';
import { reviewApi } from '@/api/reviewApi';

// ─── Types & Constants ────────────────────────────────────────────────────────
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wifi': <Wifi fontSize="small" />,
  'Gửi xe': <DirectionsCar fontSize="small" />,
  'Phòng tắm': <Shower fontSize="small" />,
  'Căng tin': <Storefront fontSize="small" />,
  'Đèn chiếu sáng': <Lightbulb fontSize="small" />,
  'Cho thuê vợt': <Star fontSize="small" />,
};

// ─── Map Section Component ────────────────────────────────────────────────────
function VenueMap({ venue }: { venue: any }) {
  const lat = parseFloat(venue.latitude);
  const lng = parseFloat(venue.longitude);
  const hasCoords = !isNaN(lat) && !isNaN(lng);
  
  // Format query parameter combining address and precise coordinates for Google Maps Search
  const mapQuery = encodeURIComponent(venue.address || (hasCoords ? `${lat},${lng}` : ''));
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  
  // URL to embed a clean Google Maps iframe
  const iframeUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  if (!venue.address && !hasCoords) {
    return (
      <Stack
        alignItems="center" justifyContent="center"
        spacing={1.5}
        sx={{
          height: 260, borderRadius: 2,
          bgcolor: '#f8fafc', border: '1.5px dashed #cbd5e1',
        }}
      >
        <LocationOn sx={{ fontSize: 44, color: '#94a3b8' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Vị trí chưa được cập nhật
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Vui lòng liên hệ hotline để được hướng dẫn
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      {/* Map Container (Google Maps Iframe) */}
      <Box
        sx={{
          height: 270,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1.5px solid #e2e8f0',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }}
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade" 
          src={iframeUrl}
        ></iframe>
      </Box>

      {/* Address + Google Maps link */}
      <Box
        sx={{
          mt: 1.5, p: 1.5,
          bgcolor: '#f8fafc', borderRadius: 1.5,
          border: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', gap: 1,
        }}
      >
        <LocationOn sx={{ fontSize: 18, color: '#2563EB', mt: 0.1, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.6, display: 'block' }}>
            {venue.address}
            {venue.wardState?.ten && `, ${venue.wardState.ten}`}
            {venue.provinceState?.ten_tinh && `, ${venue.provinceState.ten_tinh}`}
          </Typography>
        </Box>
        <Tooltip title="Mở Google Maps">
          <IconButton
            size="small"
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              flexShrink: 0, color: '#2563EB',
              '&:hover': { bgcolor: '#eff6ff' },
            }}
          >
            <OpenInNew sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, fontStyle: 'italic', px: 0.5 }}>
        * Liên hệ hotline nếu bạn gặp khó khăn khi tìm đường.
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !venue) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Không tìm thấy địa điểm. Vui lòng thử lại sau.
        </Alert>
      </Container>
    );
  }

  const images = venue.images?.length > 0 ? venue.images : [
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626224580174-3239b61d4bf1?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626224580174-3239b61d4bf1?q=80&w=2070&auto=format&fit=crop',
  ];

  const avgRating = parseFloat(venue.avg_rating || '5');

  return (
    <>
      <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', pb: 10 }}>
        {/* Breadcrumb Header */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', py: 2 }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                <Link to="/" style={{ textDecoration: 'none', color: '#64748B', fontWeight: 600 }}>
                  Cơ sở
                </Link>
                <Typography color="text.primary" sx={{ fontWeight: 700 }}>
                  {venue.name}
                </Typography>
              </Breadcrumbs>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                size="small"
                sx={{ fontWeight: 700 }}
              >
                Quay lại
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Hero Gallery */}
        <Box sx={{ bgcolor: 'white', pb: 6 }}>
          <Container maxWidth="lg" sx={{ mt: 3 }}>
            <Grid container spacing={1.5} sx={{ height: { xs: 300, md: 500 } }}>
              <Grid item xs={12} md={8}>
                <Box sx={{
                  width: '100%', height: '100%', borderRadius: 1.5,
                  overflow: 'hidden', position: 'relative',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}>
                  <img
                    src={images[0]}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                    <Chip label="SIÊU CẤP" color="primary" sx={{ fontWeight: 800, borderRadius: 1 }} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5} sx={{ height: '100%' }}>
                  <Box sx={{ flex: 1, borderRadius: 1.5, overflow: 'hidden', boxShadow: 2 }}>
                    <img
                      src={images[1] || images[0]}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{
                    flex: 1, borderRadius: 1.5, overflow: 'hidden',
                    position: 'relative', boxShadow: 2,
                  }}>
                    <img
                      src={images[2] || images[0]}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <Box sx={{
                      position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'background 0.2s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
                    }}>
                      <Typography color="white" variant="h6" sx={{ fontWeight: 700 }}>
                        +{images.length} Ảnh
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Venue Title Row */}
            <Box sx={{ mt: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 900, mb: 1.5, fontFamily: 'Times New Roman', lineHeight: 1.2 }}
                >
                  {venue.name}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Rating value={avgRating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{venue.avg_rating || '5.0'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({venue.review_count || 0} đánh giá)
                    </Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOn color="primary" sx={{ fontSize: '1.1rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {venue.address}
                      {venue.wardState?.ten && `, ${venue.wardState.ten}`}
                      {venue.provinceState?.ten_tinh && `, ${venue.provinceState.ten_tinh}`}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1.5} flexShrink={0}>
                <Tooltip title="Chia sẻ">
                  <IconButton sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Yêu thích">
                  <IconButton sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <FavoriteBorder />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={4}>

            {/* Left: Details */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ borderRadius: 1.5, overflow: 'hidden', mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, v) => setTabValue(v)}
                  sx={{
                    bgcolor: 'white', borderBottom: '1px solid #E2E8F0', px: 1,
                    '& .MuiTab-root': { fontWeight: 800, borderRadius: 1, px: 3, minHeight: 52 },
                  }}
                >
                  <Tab label="Tổng quan" />
                  <Tab label="Cơ sở vật chất" />
                  <Tab label="Đánh giá" />
                </Tabs>

                <Box sx={{ p: 3, bgcolor: 'white' }}>
                  {/* Tab 0: Overview */}
                  <TabPanel value={tabValue} index={0}>
                    <Stack spacing={4}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <NavigateNext color="primary" /> Giới thiệu địa điểm
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.9 }}>
                          {venue.description || 'Địa điểm này hiện chưa cung cấp mô tả chi tiết. Vui lòng liên hệ hotline để biết thêm thông tin về cơ sở vật chất và dịch vụ.'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                          Trang thiết bị & Tiện ích
                        </Typography>
                        <Grid container spacing={2}>
                          {venue.amenities?.length > 0 ? (
                            venue.amenities.map((item: string) => (
                              <Grid item xs={6} sm={4} key={item}>
                                <Box sx={{
                                  display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                  bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #F1F5F9',
                                  transition: 'all 0.2s',
                                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F0F9FF', borderColor: '#BFDBFE' },
                                }}>
                                  <Box sx={{ color: 'primary.main', display: 'flex', flexShrink: 0 }}>
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
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                          Giờ hoạt động
                        </Typography>
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 3, p: 2.5,
                          bgcolor: '#F0FDF4', borderRadius: 1.5, border: '1px solid #DCFCE7',
                        }}>
                          <Box sx={{
                            bgcolor: 'success.main', color: 'white',
                            p: 1.2, borderRadius: 1.5, display: 'flex', flexShrink: 0,
                          }}>
                            <AccessTime />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Mở cửa hàng ngày
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.dark', mt: 0.3 }}>
                              {venue.open_time?.slice(0, 5)} — {venue.close_time?.slice(0, 5)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Stack>
                  </TabPanel>

                  {/* Tab 1: Courts */}
                  <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
                      Danh sách sân chi tiết
                    </Typography>
                    <Stack spacing={2}>
                      {venue.courts?.length > 0 ? (
                        venue.courts.map((court: any) => (
                          <Paper key={court.id} variant="outlined" sx={{
                            p: 2.5, borderRadius: 1.5,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                          }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>{court.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Loại sân: {court.type}
                              </Typography>
                            </Box>
                            <Chip
                              label={court.status === 'active' ? 'Sẵn sàng' : 'Bảo trì'}
                              color={court.status === 'active' ? 'success' : 'warning'}
                              size="small" variant="filled"
                              sx={{ fontWeight: 800 }}
                            />
                          </Paper>
                        ))
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                          Hiện chưa có sơ đồ sân chi tiết.
                        </Alert>
                      )}
                    </Stack>
                  </TabPanel>

                  {/* Tab 2: Reviews */}
                  <TabPanel value={tabValue} index={2}>
                    {isReviewsLoading ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
                    ) : (
                      <>
                        <Box sx={{
                          display: 'flex', alignItems: 'center', mb: 4,
                          p: 3, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #F1F5F9',
                          flexWrap: 'wrap', gap: 3,
                        }}>
                          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                            <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                              {venue.avg_rating || '5.0'}
                            </Typography>
                            <Rating value={avgRating} precision={0.5} readOnly sx={{ mt: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {venue.review_count || 0} nhận xét
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                          <Stack spacing={1} sx={{ flex: 1, minWidth: 180 }}>
                            {[5, 4, 3, 2, 1].map(star => (
                              <Stack direction="row" alignItems="center" spacing={2} key={star}>
                                <Typography variant="caption" sx={{ minWidth: 44, fontWeight: 700, color: '#475569' }}>
                                  {star} sao
                                </Typography>
                                <Box sx={{ flex: 1, height: 7, bgcolor: '#E2E8F0', borderRadius: 10 }}>
                                  <Box sx={{
                                    width: star === 5 ? '82%' : star === 4 ? '12%' : '3%',
                                    height: '100%', bgcolor: 'primary.main', borderRadius: 10,
                                    transition: 'width 0.6s ease',
                                  }} />
                                </Box>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>

                        <Stack spacing={0}>
                          {reviews.map((rev: any) => (
                            <Box key={rev.id} sx={{ py: 3, borderBottom: '1px solid #F1F5F9' }}>
                              <Stack direction="row" spacing={2} mb={1.5}>
                                <Avatar src={rev.user?.avatar} sx={{ width: 42, height: 42, fontWeight: 800, bgcolor: 'primary.light' }}>
                                  {rev.user?.name?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rev.user?.name}</Typography>
                                      <Rating value={rev.rating} readOnly size="small" />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Stack>
                              <Typography variant="body2" sx={{
                                color: '#334155', lineHeight: 1.75, mb: 1.5,
                                pl: 0.5, fontSize: '0.92rem',
                              }}>
                                "{rev.comment}"
                              </Typography>
                              <Chip
                                label={`Đã đặt: ${rev.court?.name}`}
                                size="small"
                                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F0F9FF', color: '#0369a1' }}
                              />
                            </Box>
                          ))}
                          {reviews.length === 0 && (
                            <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                              Địa điểm này hiện chưa có đánh giá nào.
                            </Alert>
                          )}
                        </Stack>
                      </>
                    )}
                  </TabPanel>
                </Box>
              </Paper>
            </Grid>

            {/* Right: Booking Card + Map */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>

                {/* Booking Card */}
                <Card sx={{
                  borderRadius: 2, p: 3,
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                  border: '1px solid #E2E8F0', bgcolor: 'white',
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
                    Đặt lịch ngay ✨
                  </Typography>

                  <Stack spacing={3}>
                    <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: 1.5, border: '1px solid #E0F2FE' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Giá từ
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={0.5}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 900 }}>
                          {new Intl.NumberFormat('vi-VN').format(venue.default_price_morning || 0)}đ
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>/giờ</Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle color="success" sx={{ fontSize: '1.1rem' }} /> Ưu đãi khi đặt sân
                      </Typography>
                      <Stack spacing={0.8} sx={{ pl: 0.5 }}>
                        {['Miễn phí gửi xe & nước lọc', 'Điểm thưởng thành viên x2', 'Dễ dàng đổi lịch trước 24h'].map(perk => (
                          <Stack key={perk} direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: '#64748B' }}>{perk}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth size="large"
                      component={Link}
                      to={`/booking/${venue.slug}`}
                      sx={{
                        py: 1.8, borderRadius: 1.5,
                        fontSize: '1rem', fontWeight: 900,
                        boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)',
                        letterSpacing: 0.3,
                      }}
                    >
                      XEM LỊCH TRỐNG 📅
                    </Button>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Hỗ trợ trực tiếp
                      </Typography>
                      <Button
                        variant="outlined" fullWidth
                        startIcon={<Phone />}
                        href={`tel:${venue.phone}`}
                        sx={{ borderRadius: 1.5, py: 1.2, fontWeight: 700 }}
                      >
                        {venue.phone || 'Chưa cập nhật SĐT'}
                      </Button>
                    </Box>
                  </Stack>
                </Card>

                {/* Map Card */}
                <Paper sx={{ mt: 3, p: 2.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                    📍 Vị trí địa lý
                  </Typography>
                  <VenueMap venue={venue} />
                </Paper>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default VenueDetailPage;